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

import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { NodePaging, MinimalNodeEntity, MinimalNodeEntryEntity } from 'alfresco-js-api';
import { AlfrescoAuthenticationService, AlfrescoContentService, AlfrescoApiService, LogService, ThumbnailService } from 'ng2-alfresco-core';

@Injectable()
export class DocumentListService {

    static DEFAULT_MIME_TYPE_ICON: string = 'ft_ic_miscellaneous.svg';

    static ROOT_ID = '-root-';

    constructor(private authService: AlfrescoAuthenticationService,
                private contentService: AlfrescoContentService,
                private apiService: AlfrescoApiService,
                private logService: LogService,
                private thumbnailService: ThumbnailService) {
    }

    private getNodesPromise(folder: string, opts?: any): Promise<NodePaging> {

        let rootNodeId = DocumentListService.ROOT_ID;
        if (opts && opts.rootFolderId) {
            rootNodeId = opts.rootFolderId;
        }

        let params: any = {
            includeSource: true,
            include: ['path', 'properties', 'allowableOperations']
        };

        if (folder) {
            params.relativePath = folder;
        }

        if (opts) {
            if (opts.maxItems) {
                params.maxItems = opts.maxItems;
            }
            if (opts.skipCount) {
                params.skipCount = opts.skipCount;
            }
        }

        return this.apiService.getInstance().nodes.getNodeChildren(rootNodeId, params);
    }

    deleteNode(nodeId: string): Observable<any> {
        return Observable.fromPromise(this.apiService.getInstance().nodes.deleteNode(nodeId));
    }

    /**
     * Create a new folder in the path.
     * @param name Folder name
     * @param parentId Parent folder ID
     * @returns {any}
     */
    createFolder(name: string, parentId: string): Observable<MinimalNodeEntity> {
        return Observable.fromPromise(this.apiService.getInstance().nodes.createFolder(name, '/', parentId))
            .catch(err => this.handleError(err));
    }

    /**
     * Gets the folder node with the specified relative name path below the root node.
     * @param folder Path to folder.
     * @param opts Options.
     * @returns {Observable<NodePaging>} Folder entity.
     */
    getFolder(folder: string, opts?: any) {
        return Observable.fromPromise(this.getNodesPromise(folder, opts))
            .map(res => <NodePaging> res)
            .catch(err => this.handleError(err));
    }

    getFolderNode(nodeId: string): Promise<MinimalNodeEntryEntity> {
        let opts: any = {
            includeSource: true,
            include: ['path', 'properties', 'allowableOperations']
        };

        let nodes: any = this.apiService.getInstance().nodes;
        return nodes.getNodeInfo(nodeId, opts);
    }

    /**
     * Get thumbnail URL for the given document node.
     * @param node Node to get URL for.
     * @returns {string} URL address.
     */
    getDocumentThumbnailUrl(node: MinimalNodeEntity) {
        return this.thumbnailService.getDocumentThumbnailUrl(node);
    }

    getMimeTypeIcon(mimeType: string): string {
        return this.thumbnailService.getMimeTypeIcon(mimeType);
    }

    private handleError(error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        this.logService.error(error);
        return Observable.throw(error || 'Server error');
    }
}
