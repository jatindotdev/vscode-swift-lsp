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
import { SwiftOutputChannel } from "./ui/SwiftOutputChannel";
import { LanguageClientManager } from "./sourcekit-lsp/LanguageClientManager";
import { TemporaryFolder } from "./utilities/tempFolder";
import { SwiftToolchain } from "./toolchain/toolchain";
import { CommentCompletionProviders } from "./editor/CommentCompletion";
import { FolderContext } from "./FolderContext";

/**
 * Context for whole workspace. Holds array of contexts for each workspace folder
 * and the ExtensionContext
 */
export class WorkspaceContext implements vscode.Disposable {
    public folders: FolderContext[] = [];
    public currentFolder: FolderContext | null | undefined;
    public currentDocument: vscode.Uri | null;
    public outputChannel: SwiftOutputChannel;
    public languageClientManager: LanguageClientManager;
    public subscriptions: { dispose(): unknown }[];
    public commentCompletionProvider: CommentCompletionProviders;

    private constructor(public tempFolder: TemporaryFolder, public toolchain: SwiftToolchain) {
        this.outputChannel = new SwiftOutputChannel();
        this.languageClientManager = new LanguageClientManager(this);
        this.outputChannel.log(this.toolchain.swiftVersionString);
        this.toolchain.logDiagnostics(this.outputChannel);
        this.currentDocument = null;
        this.commentCompletionProvider = new CommentCompletionProviders();

        const onChangeConfig = vscode.workspace.onDidChangeConfiguration(event => {
            // on toolchain config change, reload window
            if (event.affectsConfiguration("swift.disable")) {
                vscode.window
                    .showInformationMessage("Disabe requires the project be reloaded.", "Reload")
                    .then(selected => {
                        if (selected === "Reload") {
                            vscode.commands.executeCommand("workbench.action.reloadWindow");
                        }
                    });
            }
            if (event.affectsConfiguration("swift.path")) {
                vscode.window
                    .showInformationMessage(
                        "Changing the Swift path requires the project be reloaded.",
                        "Reload"
                    )
                    .then(selected => {
                        if (selected === "Reload") {
                            vscode.commands.executeCommand("workbench.action.reloadWindow");
                        }
                    });
            }
            if (event.affectsConfiguration("swift.serverPath")) {
                vscode.window
                    .showInformationMessage(
                        "Changing the Swift server path requires the project be reloaded.",
                        "Reload"
                    )
                    .then(selected => {
                        if (selected === "Reload") {
                            vscode.commands.executeCommand("workbench.action.reloadWindow");
                        }
                    });
            }
            if (event.affectsConfiguration("swift.serverArguments")) {
                vscode.window
                    .showInformationMessage(
                        "Changing the Swift server arguments requires the project be reloaded.",
                        "Reload"
                    )
                    .then(selected => {
                        if (selected === "Reload") {
                            vscode.commands.executeCommand("workbench.action.reloadWindow");
                        }
                    });
            }
        });
        this.subscriptions = [
            this.languageClientManager,
            this.commentCompletionProvider,
            this.outputChannel,
            onChangeConfig,
        ];
    }

    dispose() {
        this.folders.forEach(f => f.dispose());
        this.subscriptions.forEach(item => item.dispose());
    }

    get swiftVersion() {
        return this.toolchain.swiftVersion;
    }

    /** Get swift version and create WorkspaceContext */
    static async create(): Promise<WorkspaceContext> {
        const tempFolder = await TemporaryFolder.create();
        const toolchain = await SwiftToolchain.create();
        return new WorkspaceContext(tempFolder, toolchain);
    }

    /** Setup the vscode event listeners to catch folder changes and active window changes */
    setupEventListeners() {
        // No event listeners are needed for the extension to work
    }

    /**
     * Fire an event to all folder observers
     * @param folder folder to fire event for
     * @param event event type
     */
    async fireEvent(folder: FolderContext | null, event: FolderEvent) {
        for (const observer of this.observers) {
            await observer(folder, event, this);
        }
    }

    /**
     * set the focus folder
     * @param folder folder that has gained focus, you can have a null folder
     */
    async focusFolder(folderContext: FolderContext | null) {
        // null and undefined mean different things here. Undefined means nothing
        // has been setup, null means we want to send focus events but for a null
        // folder
        if (folderContext === this.currentFolder) {
            return;
        }

        // send unfocus event for previous folder observers
        if (this.currentFolder !== undefined) {
            await this.fireEvent(this.currentFolder, FolderEvent.unfocus);
        }
        this.currentFolder = folderContext;

        // send focus event to all observers
        await this.fireEvent(folderContext, FolderEvent.focus);
    }

    /**
     * called when a folder is removed from workspace
     * @param folder folder being removed
     */
    async removeFolder(folder: vscode.WorkspaceFolder) {
        // find context with root folder
        const index = this.folders.findIndex(context => context.workspaceFolder === folder);
        if (index === -1) {
            console.error(`Trying to delete folder ${folder} which has no record`);
            return;
        }
        const context = this.folders[index];
        // if current folder is this folder send unfocus event by setting
        // current folder to undefined
        if (this.currentFolder === context) {
            this.focusFolder(null);
        }
        // run observer functions in reverse order when removing
        const observersReversed = [...this.observers];
        observersReversed.reverse();
        for (const observer of observersReversed) {
            await observer(context, FolderEvent.remove, this);
        }
        context.dispose();
        // remove context
        this.folders.splice(index, 1);
    }

    /**
     * Add workspace folder event observer
     * @param fn observer function to be called when event occurs
     * @returns disposable object
     */
    observeFolders(fn: WorkspaceFoldersObserver): vscode.Disposable {
        this.observers.add(fn);
        return { dispose: () => this.observers.delete(fn) };
    }

    private observers: Set<WorkspaceFoldersObserver> = new Set();
}

/** Workspace Folder events */
export enum FolderEvent {
    // Workspace folder has been added
    add = "add",
    // Workspace folder has been removed
    remove = "remove",
    // Workspace folder has gained focus via a file inside the folder becoming the actively edited file
    focus = "focus",
    // Workspace folder loses focus because another workspace folder gained it
    unfocus = "unfocus",
}

/** Workspace Folder observer function */
export type WorkspaceFoldersObserver = (
    folder: FolderContext | null,
    operation: FolderEvent,
    workspace: WorkspaceContext
) => unknown;
