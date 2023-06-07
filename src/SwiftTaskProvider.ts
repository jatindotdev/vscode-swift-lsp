//===----------------------------------------------------------------------===//
//
// This source file is part of the VSCode Swift open source project
//
// Copyright (c) 2021-2022 the VSCode Swift project authors
// Licensed under Apache License v2.0
//
// See LICENSE.txt for license information
// See CONTRIBUTORS.txt for the list of VSCode Swift project authors
//
// SPDX-License-Identifier: Apache-2.0
//
//===----------------------------------------------------------------------===//

import * as vscode from "vscode";
import { getSwiftExecutable } from "./utilities/utilities";

/**
 * References:
 *
 * - General information on tasks:
 *   https://code.visualstudio.com/docs/editor/tasks
 * - Contributing task definitions:
 *   https://code.visualstudio.com/api/references/contribution-points#contributes.taskDefinitions
 * - Implementing task providers:
 *   https://code.visualstudio.com/api/extension-guides/task-provider
 */

// Interface class for defining task configuration
interface TaskConfig {
    cwd: vscode.Uri;
    scope: vscode.TaskScope | vscode.WorkspaceFolder;
    group?: vscode.TaskGroup;
    problemMatcher?: string | string[];
    presentationOptions?: vscode.TaskPresentationOptions;
    prefix?: string;
    disableTaskQueue?: boolean;
}

/**
 * Helper function to create a {@link vscode.Task Task} with the given parameters.
 */
export function createSwiftTask(args: string[], name: string, config: TaskConfig): vscode.Task {
    const swift = getSwiftExecutable();

    // Add relative path current working directory
    const cwd = config.cwd.fsPath;
    const fullCwd = config.cwd.fsPath;

    /* Currently there seems to be a bug in vscode where kicking off two tasks
     with the same definition but different scopes messes with the task
     completion code. When that is resolved we will go back to the code below
     where we only store the relative cwd instead of the full cwd

    const scopeWorkspaceFolder = config.scope as vscode.WorkspaceFolder;
    if (scopeWorkspaceFolder.uri.fsPath) {
        cwd = path.relative(scopeWorkspaceFolder.uri.fsPath, config.cwd.fsPath);
    } else {
        cwd = config.cwd.fsPath;
    }*/

    const task = new vscode.Task(
        { type: "swift", args: args, cwd: cwd, disableTaskQueue: config.disableTaskQueue },
        config?.scope ?? vscode.TaskScope.Workspace,
        name,
        "swift",
        new vscode.ProcessExecution(swift, args, {
            cwd: fullCwd,
        }),
        config?.problemMatcher
    );
    // This doesn't include any quotes added by VS Code.
    // See also: https://github.com/microsoft/vscode/issues/137895

    let prefix: string;
    if (config?.prefix) {
        prefix = `(${config.prefix}) `;
    } else {
        prefix = "";
    }
    task.detail = `${prefix}swift ${args.join(" ")}`;
    task.group = config?.group;
    task.presentationOptions = config?.presentationOptions ?? {};
    return task;
}
