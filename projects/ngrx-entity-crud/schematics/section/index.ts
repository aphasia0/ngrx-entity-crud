import {chain, Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {strings} from '@angular-devkit/core';
import {addRouteDeclarationToNgModule, render} from '../my-utility';

export function crudSection(options: CrudSection): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    options.clazz = strings.classify(options.clazz);
    const workspaceConfig = tree.read('/angular.json');
    if (!workspaceConfig) {
      throw new SchematicsException('Could not find Angular workspace configuration');
    }

    // convert workspace to string
    const workspaceContent = workspaceConfig.toString();

    // parse workspace string into JSON object
    const workspace = JSON.parse(workspaceContent);
    if (!options.project) {
      options.project = workspace.defaultProject;
    }

    const projectName = options.project as string;

    const project = workspace.projects[projectName];

    const projectType = project.projectType === 'application' ? 'app' : 'lib';

    options.path = `${project.sourceRoot}/${projectType}`;
    const lib = options.lib;

    let pathApp: string = 'src/app';
    let pathStore: string = 'src/app/root-store';
    let pathView: string = 'src/app/main/views';
    let pathService: string = 'src/app/main/services';
    let pathVo: string = 'src/app/main/models/vo/';

    const conf = tree.read('/ngrx-entity-crud.conf.json');
    if (conf) {
      const confData = JSON.parse(conf.toString());
      pathView = confData.pathView;
      pathStore = confData.pathStore;
      pathApp = confData.pathApp;
      pathService = confData.pathService;
      pathVo = confData.pathVo;
    }

    console.log('pathView', pathView);
    console.log('pathStore', pathStore);
    console.log('pathApp', pathApp);
    console.log('pathService', pathService);
    console.log('pathVo', pathVo);

    console.log('lib: ', lib);

    const _chain = [];
    _chain.push(render(options, `./files/${lib}`, pathView));

    _chain.push(addRouteDeclarationToNgModule({
        module: `${pathApp}/app-routing.module.ts`,
        routeLiteral: `{path: '${strings.dasherize(options.clazz)}', loadChildren: () => import('./main/views/${strings.dasherize(options.clazz)}/${strings.dasherize(options.clazz)}.module').then(m => m.${options.clazz}Module)}`
      }
    ));
    return chain(_chain);
  };
}




