import {apply, mergeWith, move, Rule, SchematicContext, SchematicsException, template, Tree, url} from "@angular-devkit/schematics";
import {normalize, strings} from "@angular-devkit/core";
import {ModuleOptions} from "./utility/find-module";
import * as ts from "typescript/lib/tsserverlibrary";
import {addImportToModule, addRouteDeclarationToModule} from "./utility/ast-utils";
import {InsertChange} from "./utility/change";
import * as merge from "deepmerge"

/**
 * Aggiunge l'export nell'index.ts e index.d.ts
 * @param options
 * @param file
 */
export function addExport(options: { clazz: string }, file: string): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const content: Buffer | null = tree.read(file);
        let strContent: string = '';
        if (content) strContent = content.toString();

        const dirName = `${strings.dasherize(options.clazz)}-store`;

        const updatedContent = strContent.concat("\nexport * from './" + dirName + "';");
        tree.overwrite(file, updatedContent);
        return tree;
    };
}

/**
 * Aggiorna l'interfaccia dell'interfaccia
 * @param options
 * @param file
 */
export function updateState(options: { name: string, clazz: string }, file: string): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const content: Buffer | null = tree.read(file);
        let strContent: string = '';
        if (content) strContent = content.toString();
        const startIndex = strContent.indexOf("export");
        const endIndex = strContent.indexOf("{", startIndex);
        const newLine = `${strings.underscore(options.name)}:${options.clazz}StoreState.State;`;
        strContent = strContent.slice(0, endIndex + 1) + "\n" + newLine + strContent.slice(endIndex + 1);
        tree.overwrite(file, strContent);
        return tree;
    };
}

/**
 * Aggiunge l'import nella parte del file.
 * @param file
 * @param importString
 */
export function addImport(file: string, importString: string): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const content: Buffer | null = tree.read(file);
        let strContent: string = '';
        if (content) strContent = content.toString();
        strContent = importString + "\n" + strContent;
        tree.overwrite(file, strContent);
        return tree;
    };
}

/**
 * Aggiunge al selettore principale RootSelector, i riferimenti allo store appena creato.
 * @param options
 * @param file
 */
export function addRootSelector(options: { clazz: string }, file: string): Rule {
    return (tree: Tree) => {
        const content: Buffer | null = tree.read(file);
        let strContent: string = '';
        if (content) strContent = content.toString();
        strContent = addLine(strContent, ['selectError', 'createSelectorFactory', 'customMemoizer', '('], `${options.clazz}StoreSelectors.selectError,`);
        strContent = addLine(strContent, ['selectIsLoading', 'createSelectorFactory', 'customMemoizer', '('], `${options.clazz}StoreSelectors.selectIsLoading,`);

        tree.overwrite(file, strContent);
        return tree;
    }
}

/**
 * viene aggiornato un un file che contiene un json
 * @param options
 * @param file
 */
export function updateJson(objToMerge: any, file: string): Rule {
    return (tree: Tree) => {
        const content: Buffer | null = tree.read(file);
        let strContent: string = '';
        if (content) strContent = content.toString();
        const obj = JSON.parse(strContent);

        const objB = merge(obj, objToMerge);

        const result = JSON.stringify(objB);
        tree.overwrite(file, result);
        return tree;
    }
}

/**
 * Aggiunge una linea all'interno di un file.
 * Il punto dove viene aggiunto viene indicato passando una serie di pattern a comporre un percorso univoco all'interno del file.
 * La linea verrà aggiunta immediatamento dopo l'ultimo pattern.
 *
 * @param content attuale contenuto testuale del file a cui aggiungerela linea
 * @param patterns sequenza di chiavi che servono a identificare il punto dove aggiungere la linea, come per i css
 * @param newLine linea da aggiungere
 */
export function addLine(content: string, patterns: string[], newLine: string): string {

    let index = 0;
    patterns.forEach(value => {
        index = content.indexOf(value, index) + value.length;
    });

    return content.slice(0, index + 1) + newLine + content.slice(index);
}

/**
 * Aggiunge il modulo del nuovo store creato, come dipendenza del modulo Root
 * @param options
 */
export function addDeclarationToNgModule(options: ModuleOptions): Rule {
    return (host: Tree) => {
        if (!options.module) {
            return host;
        }

        const modulePath = options.module;

        const text = host.read(modulePath);
        if (text === null) {
            throw new SchematicsException(`File ${modulePath} does not exist.`);
        }
        const sourceText = text.toString();
        const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

        // const relativePath = buildRelativeModulePath(options, modulePath);
        const changes = addImportToModule(source,
            modulePath,
            strings.classify(`${options.name}Module`),
            options.path as string);

        const recorder = host.beginUpdate(modulePath);
        for (const change of changes) {
            if (change instanceof InsertChange) {
                recorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(recorder);

        return host;
    };
}

/**
 * Aggiunge il modulo del nuovo store creato, come dipendenza del modulo Root
 * @param options
 */
export function addRouteDeclarationToNgModule(options: { module: string, routeLiteral: string }): Rule {
    return (host: Tree) => {
        if (!options.module) {
            return host;
        }

        const modulePath = options.module;

        const text = host.read(modulePath);
        if (text === null) {
            throw new SchematicsException(`File ${modulePath} does not exist.`);
        }
        const sourceText = text.toString();
        const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

        const change = addRouteDeclarationToModule(source,
            modulePath,
            options.routeLiteral);

        const recorder = host.beginUpdate(modulePath);
        if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
        host.commitUpdate(recorder);

        return host;
    };
}

/**
 * recupera la path dal file tsconfig.json utilizzando come chiave l'alias, ad esempio per ricavare la path imposta per l'alias "@services/*" o "@models/*"
 * le path vengono settate di default dallo schematics init-app con dei valori che possono essere modificati dall'utente.
 * valori predefiniti per le path:
 *    "paths": {
 *           "@components/*": [
 *               "src/app/main/components/*"
 *           ],
 *               "@services/*": [
 *               "src/app/main/services/*"
 *           ],
 *               "@models/*": [
 *               "src/app/main/models/*"
 *           ],
 *               "@views/*": [
 *               "src/app/main/views/*"
 *           ],
 *               "@core/*": [
 *               "src/app/core/*"
 *           ],
 *               "@root-store/*": [
 *               "src/app/root-store/*"
 *           ]
 *       }
 * @param tree
 * @param alias nome dell'alias, ad esempio "@components/*", "@services/*" ...
 */
export function getPathFromAlias(tree: Tree, alias: string): string {
    const content: Buffer | null = tree.read("tsconfig.json");
    let strContent: string = '';
    if (content) strContent = content.toString();
    const obj = JSON.parse(strContent);
    let result = (obj.compilerOptions.paths[alias][0] as string).replace('*', '');
    return normalize(result);
}

/**
 *
 * @param options
 * @param sourceTemplate
 * @param path
 */
export function render(options: any, sourceTemplate: string, path: string): Rule {
    return (_tree: Tree, _context: SchematicContext) => {
        const sourceTemplate_ = url(sourceTemplate as string);
        const path_: string = normalize(path);
        const sourceTemplateParametrized = apply(sourceTemplate_, [
            template({
                ...options,
                ...strings
            }),
            move(path_)
        ]);
        return mergeWith(sourceTemplateParametrized);
    };
}
