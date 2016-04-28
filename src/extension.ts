'use strict';

import * as vscode from 'vscode';

import {flow} from './flow';
import {fail} from './fail.ts'


export function activate(context: vscode.ExtensionContext) {
    const runWrapped = async function<T>(fn: (...any) => Thenable<T>, args: any[] = []): Promise<T> {
        try {
            return await fn(...args);
        } catch(e) {
            if (!e.handlers || !e.message)
                throw e;

            const err: fail.IError = e;
            const chosen = await vscode.window.showErrorMessage(err.message, ...err.handlers);
            if (!!chosen) {
                return await runWrapped(chosen.cb);
            }
        }
    };

    const commands = [
        vscode.commands.registerCommand('gitflow.initialize', async function() {
            await runWrapped(flow.initialize);
        }),
        vscode.commands.registerCommand('gitflow.featureStart', async function () {
            const name = await vscode.window.showInputBox({
                placeHolder: 'my-awesome-feature',
                prompt: 'A new name for your feature',
            });
            if (!name)
                return;
            await runWrapped(flow.feature.start, [name]);
        }),
        vscode.commands.registerCommand('gitflow.featureFinish', async function() {
            await runWrapped(flow.feature.finish);
        }),
    ];

    context.subscriptions.push(...commands);
}

export function deactivate() {
}