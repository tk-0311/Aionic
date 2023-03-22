import * as T from "../types"
import { HydratedDocument } from "mongoose"
import {Node, App} from "../config/MongoDb"

export const addNode = async (req: Request | undefined, res:any): Promise<T.Node> => {
  // create and save the node to the app
  try {
    const {uid, manifest,revision, sourceType} = res.locals
    const app:HydratedDocument<T.App> = await App.findOne({uid: uid})
    const node:HydratedDocument<T.Node> = await Node.create({manifest: manifest, revision:revision, sourceType: sourceType})
    if (app.head === null) {
      app.head = node._id
      app.tail = node._id
    } else {
      const prevNode:HydratedDocument<T.Node> = await Node.findOne({_id: app.tail});
      prevNode.next = node._id;
      node.prev = app.tail;
      app.tail = node._id;
      prevNode.save();
      node.save();
    }
    app.save()
    if (req === undefined) return Promise.resolve(node)
  } catch(err) {
    const error:T.error = {
      message: `server/middleware/dbController.js dbController.addNode ${typeof err === 'object'? JSON.stringify(err) : err }`,
      status:500,
      log:'data base error'
    }
    console.log(err)
    return Promise.reject(error)
  }
}