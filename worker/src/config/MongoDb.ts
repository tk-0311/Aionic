import mongoose, { Schema } from 'mongoose'
import { config } from '../keys'
import * as T from "../types"

const uri = config.mongodb_uri;

mongoose.connect(uri, {
  dbName: 'Aionic'
})
  .then(() => console.log('Connected to Mongo DB.'))
  .catch(err => console.log(err));

const AppSchema = new Schema<T.App>({
  uid: {type: String, required: true, unique: true},
  name: {type: String, required: true},
  source: {type: {
    repoURL: String,
    path:String,
    targetRevision: String
  }, required: true},
  date: {type: Date, default: Date.now()},
  head: {type: String, default: null},
  tail: {type: String, default: null}
})

const NodeSchema = new Schema<T.Node>({
  manifest: {type: String, required: true}, //stringify
  revision: {type: String, required: true},
  sourceType: {type: String, required: true},
  prev: {type: String, default: null},
  next: {type: String, default: null}
})

const ApiKeySchema = new Schema<T.ApiKey>({
  api_key: {type: String, required: true, unique: true},
  url: {type: String, required: true}
})

export const ApiKey =  mongoose.model<T.ApiKey>("ApiKey",ApiKeySchema)
export const App =  mongoose.model<T.App>("App", AppSchema)
export const Node =  mongoose.model<T.Node>("Node", NodeSchema)