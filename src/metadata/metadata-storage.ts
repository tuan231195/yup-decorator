import { Schema } from 'yup';

export class MetadataStorage {
    private _metadataMap = new Map<Function, Map<string, Schema<any>>>();
    private _metadataCache = new Map<Function, Map<string, Schema<any>>>();

    addSchemaMetadata({ target, schema, property }) {
        let schemaMap = this._metadataMap.get(target);
        if (!schemaMap) {
            schemaMap = new Map<string, Schema<any>>();
            this._metadataMap.set(target, schemaMap);
        }
        schemaMap.set(property, schema);
    }

    findSchemaMetadata(target) {
        const cachedValue = this._metadataCache.get(target);
        if (cachedValue) {
            return cachedValue;
        }
        const inheritanceMaps: Array<Map<string, Schema<any>>> = [];
        let currentTarget = target;
        do {
            const schema = this._metadataMap.get(currentTarget);
            if (schema) {
                inheritanceMaps.unshift(schema);
            }
            const currentPrototype = Object.getPrototypeOf(
                currentTarget.prototype
            );
            currentTarget = currentPrototype && currentPrototype.constructor;
        } while (currentTarget);
        if (!inheritanceMaps.length) {
            return null;
        }
        const schemaMap = new Map<string, Schema<any>>(
            [].concat(...inheritanceMaps.map(map => Array.from(map.entries())))
        );
        this._metadataCache.set(target, schemaMap);
        return schemaMap;
    }
}
