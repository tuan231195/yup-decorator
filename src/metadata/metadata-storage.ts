import { Schema } from 'yup';

export class MetadataStorage {
    private _metadataMap = new Map<Function, Map<string, Schema<any>>>();

    addSchemaMetadata({ target, schema, property }) {
        let schemaMap = this._metadataMap.get(target);
        if (!schemaMap) {
            schemaMap = new Map<string, Schema<any>>();
            this._metadataMap.set(target, schemaMap);
        }
        schemaMap.set(property, schema);
    }

    findSchemaMetadata(target) {
        return this._metadataMap.get(target);
    }
}
