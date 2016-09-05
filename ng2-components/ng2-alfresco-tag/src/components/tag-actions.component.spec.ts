/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { it, describe, inject, beforeEachProviders, beforeEach, afterEach } from '@angular/core/testing';
import { TestComponentBuilder } from '@angular/compiler/testing';
import { AlfrescoAuthenticationService, AlfrescoSettingsService } from 'ng2-alfresco-core';
import { TagService } from '../services/tag.service';
import { TagActionsComponent } from './tag-actions.component';

declare let jasmine: any;

describe('Tag actions list', () => {

    let tagActionsListFixture, element, component;

    let dataTag = {
        'list': {
            'pagination': {
                'count': 3,
                'hasMoreItems': false,
                'totalItems': 3,
                'skipCount': 0,
                'maxItems': 100
            },
            'entries': [{
                'entry': {'tag': 'test1', 'id': '0ee933fa-57fc-4587-8a77-b787e814f1d2'}
            }, {'entry': {'tag': 'test2', 'id': 'fcb92659-1f10-41b4-9b17-851b72a3b597'}}, {
                'entry': {'tag': 'test3', 'id': 'fb4213c0-729d-466c-9a6c-ee2e937273bf'}
            }]
        }
    };

    beforeEachProviders(() => {
        return [
            AlfrescoSettingsService,
            AlfrescoAuthenticationService,
            TagService
        ];
    });

    beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
        return tcb
            .createAsync(TagActionsComponent)
            .then(fixture => {
                tagActionsListFixture = fixture;
                element = tagActionsListFixture.nativeElement;
                component = tagActionsListFixture.componentInstance;
            });
    }));

    describe('Rendering tests', () => {

        beforeEach(() => {
            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
        });

        it('Tag list relative a single node should be rendered', (done) => {
            component.nodeId = 'fake-node-id';

            component.resultsEmitter.subscribe(() => {
                tagActionsListFixture.detectChanges();

                expect(element.querySelector('#tag_name_0').innerHTML).toBe('test1');
                expect(element.querySelector('#tag_name_1').innerHTML).toBe('test2');
                expect(element.querySelector('#tag_name_2').innerHTML).toBe('test3');

                expect(element.querySelector('#tag_delete_0')).not.toBe(null);
                expect(element.querySelector('#tag_delete_1')).not.toBe(null);
                expect(element.querySelector('#tag_delete_2')).not.toBe(null);

                done();
            });

            component.ngOnChanges();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: dataTag
            });
        });

        it('Tag list click on delete button should delete the tag', (done) => {
            component.nodeId = 'fake-node-id';

            component.resultsEmitter.subscribe(() => {
                tagActionsListFixture.detectChanges();
                element.querySelector('#tag_delete_0').click();
                tagActionsListFixture.detectChanges();

                expect(jasmine.Ajax.requests.at(1).url).
                toBe('http://localhost:8080/alfresco/api/-default-/public/alfresco/versions/1/nodes/fake-node-id/tags/0ee933fa-57fc-4587-8a77-b787e814f1d2');
                expect(jasmine.Ajax.requests.at(1).method).toBe('DELETE');
                done();
            });

            component.ngOnChanges();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: dataTag
            });
        });

        it('Add tag', (done) => {
            component.nodeId = 'fake-node-id';
            component.newTagName = 'fake-tag-name';

            tagActionsListFixture.detectChanges();

            component.addEmitter.subscribe(() => {
                done();
            });

            element.querySelector('#add-tag').click();

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200
            });
        });
    });
});
