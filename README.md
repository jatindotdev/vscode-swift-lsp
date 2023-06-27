# Swift for Visual Studio Code

🔥 A fork of the [Swift for Visual Studio Code](github.com/swift-server/vscode-swift) extension with only support for LSP via the Apple project [SourceKit-LSP](https://github.com/apple/sourcekit-lsp). I have created this fork for my personal use as I dont use the other features of the extension and just want the LSP support.

> Last Updated to hash `67c766d` Jun 15, 2023

This extension adds language support for Swift to Visual Studio Code. It supports:

-   Code completion
-   Jump to definition, peek definition, find all references, symbol search
-   Error annotations and apply suggestions from errors

Swift support uses [SourceKit LSP](https://github.com/apple/sourcekit-lsp) for the [language server](https://microsoft.github.io/language-server-protocol/overviews/lsp/overview/) to power code completion.

## Contributing

If you find any errors or want to want to improve the extension, would appreciate if you could open a PR.

The Swift for Visual Studio Code extension is a community driven project, developed by the amazing Swift community. Any kind of contribution is appreciated, including code, tests and documentation. For more details see [CONTRIBUTING.md](CONTRIBUTING.md).


## The Original Extension

The [Swift for Visual Studio Code](github.com/swift-server/vscode-swift) is developed by members of the Swift Community and maintained by the [SSWG](https://www.swift.org/sswg/). The aim is to provide a first-class, feature complete extension to make developing Swift applications on all platforms a seamless experience.

If you experience any issues or want to propose new features please [create an issue](https://github.com/swift-server/vscode-swift/issues/new) or post on the `#vscode-swift` channel on [Slack](https://swift-server.slack.com).

## Installation

For the extension to work, you must have Swift installed on your system. Please see the [Getting Started Guide on Swift.org](https://www.swift.org/getting-started/) for details on how to install Swift on your system. Install the extension from [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=jatindotdev.swift-lsp) and open a Swift package! You'll be prompted to install and configure the CodeLLDB extension, which you should do so.

## Features

### Language features

The extension provides language features such as code completion and jump to definition via the Apple project [SourceKit-LSP](https://github.com/apple/sourcekit-lsp). For these to work fully it is required that the project has been built at least once. Every time you add a new dependency to your project you should build it so SourceKit-LSP can extract the symbol data for that dependency.
