/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zdsqqannjfmbh8h")

  collection.updateRule = "@request.auth.id = created_by.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("zdsqqannjfmbh8h")

  collection.updateRule = null

  return dao.saveCollection(collection)
})
