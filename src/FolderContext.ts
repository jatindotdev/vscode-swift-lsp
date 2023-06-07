//===----------------------------------------------------------------------===//
//
// This source file is part of the VSCode Swift open source project
//
// Copyright (c) 2021 the VSCode Swift project authors
// Licensed under Apache License v2.0
//
// See LICENSE.txt for license information
// See CONTRIBUTORS.txt for the list of VSCode Swift project authors
//
// SPDX-License-Identifier: Apache-2.0
//
//===----------------------------------------------------------------------===//

import * as vscode from "vscode";
import * as path from "path";
import { WorkspaceContext, FolderEvent } from "./WorkspaceContext";

export class FolderContext implements vscode.Disposable {
    public hasResolveErrors = false;

    /**
     * FolderContext constructor
     * @param folder Workspace Folder
     * @param swiftPackage Swift Package inside the folder
     * @param workspaceContext Workspace context
     */
    private constructor(
        public folder: vscode.Uri,
        public workspaceFolder: vscode.WorkspaceFolder,
        public workspaceContext: WorkspaceContext
    ) {}

    /** dispose of any thing FolderContext holds */
    dispose() {
        // nothing to dispose
    }

    get name(): string {
        const relativePath = this.relativePath;
        if (relativePath.length === 0) {
            return this.workspaceFolder.name;
        } else {
            return `${this.workspaceFolder.name}/${this.relativePath}`;
        }
    }

    get relativePath(): string {
        return path.relative(this.workspaceFolder.uri.fsPath, this.folder.fsPath);
    }

    get isRootFolder(): boolean {
        return this.workspaceFolder.uri === this.folder;
    }

    /**
     * Fire an event to all folder observers
     * @param event event type
     */
    async fireEvent(event: FolderEvent) {
        this.workspaceContext.fireEvent(this, event);
    }

    /** Return edited Packages folder */
    editedPackageFolder(identifier: string) {
        return path.join(this.folder.fsPath, "Packages", identifier);
    }

    static uriName(uri: vscode.Uri): string {
        return path.basename(uri.fsPath);
    }
}

export interface EditedPackage {
    name: string;
    folder: string;
}
