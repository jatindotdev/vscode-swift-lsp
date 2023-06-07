//===----------------------------------------------------------------------===//
//
// This source file is part of the VSCode Swift open source project
//
// Copyright (c) 2021-2023 the VSCode Swift project authors
// Licensed under Apache License v2.0
//
// See LICENSE.txt for license information
// See CONTRIBUTORS.txt for the list of VSCode Swift project authors
//
// SPDX-License-Identifier: Apache-2.0
//
//===----------------------------------------------------------------------===//

import * as vscode from "vscode";
import { WorkspaceContext } from "./WorkspaceContext";
import { getErrorDescription } from "./utilities/utilities";

/**
 * External API as exposed by the extension. Can be queried by other extensions
 * or by the integration test runner for VSCode extensions.
 */
export interface Api {
    workspaceContext: WorkspaceContext;
}

/**
 * Activate the extension. This is the main entry point.
 */
export async function activate(context: vscode.ExtensionContext): Promise<Api> {
    try {
        console.debug("Activating Swift for Visual Studio Code...");

        const workspaceContext = await WorkspaceContext.create();

        context.subscriptions.push(workspaceContext);

        // listen for workspace folder changes and active text editor changes
        workspaceContext.setupEventListeners();

        // observer for logging workspace folder addition/removal
        const logObserver = workspaceContext.observeFolders((folderContext, event) => {
            workspaceContext.outputChannel.log(
                `${event}: ${folderContext?.folder.fsPath}`,
                folderContext?.name
            );
        });

        // Register any disposables for cleanup when the extension deactivates.
        context.subscriptions.push(logObserver);

        console.debug("Swift for Visual Studio Code activated.");

        return { workspaceContext };
    } catch (error) {
        const errorMessage = getErrorDescription(error);
        // show this error message as the VSCode error message only shows when running
        // the extension through the debugger
        vscode.window.showErrorMessage(`Activating Swift extension failed: ${errorMessage}`);
        throw Error(errorMessage);
    }
}

/**
 * Deactivate the extension.
 *
 * Any disposables registered in `context.subscriptions` will be automatically
 * disposed of, so there's nothing left to do here.
 */
export function deactivate() {
    return;
}
