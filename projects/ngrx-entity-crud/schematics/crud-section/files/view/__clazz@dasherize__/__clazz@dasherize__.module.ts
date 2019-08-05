import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {<%= clazz %>EditComponent} from './<%= dasherize(clazz) %>-edit/<%= dasherize(clazz) %>-edit.component';
import {<%= clazz %>MainComponent} from './<%= dasherize(clazz) %>-main/<%= dasherize(clazz) %>-main.component';
import {<%= clazz %>TableComponent} from './<%= dasherize(clazz) %>-table/<%= dasherize(clazz) %>-table.component';
import {<%= clazz %>RoutingModule} from './<%= dasherize(clazz) %>-routing.module';

@NgModule({
  declarations: [<%= clazz %>EditComponent, <%= clazz %>MainComponent, <%= clazz %>TableComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    <%= clazz %>RoutingModule
  ],
  providers: [],
  entryComponents: []
})
export class <%= clazz %>Module {
}
