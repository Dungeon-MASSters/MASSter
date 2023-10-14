/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zdsqqannjfmbh8h")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "npkmervp",
    "name": "type",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zdsqqannjfmbh8h")

  // remove
  collection.schema.removeField("npkmervp")

  return dao.saveCollection(collection)
})
