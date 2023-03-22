import { Node, App } from '../config/MongoDb';
import {addNode} from './dbservice';
import { config } from '../keys';
import * as T from "../types"


export const startAutoUpdate =  ():NodeJS.Timer  => {
  let init:boolean = true;
  return setInterval(async () => {
    try {
      const {url, api_key}:T.ApiKey = config.global
      let appList:T.App[] = []
      const data = await fetch(`${url}/api/v1/applications`, {
        method:"GET",
        headers: {
          Authorization: `Bearer ${api_key}`,
        }})
      let apps = await data.json();
        appList = apps.items.map( (app: any) => {
          const {name, uid} = app.metadata
          const {source} = app.spec
          return {name, uid, source}
        })
      if (init) {
        init = false;
        await updateAppList(appList)
      }else {
        appList = (await updateAppList(appList)) as T.App[]
      }
      if (appList.length > 0) {
        for (let app of appList) {
          let appDb:T.App = await App.findOne({uid: app.uid});
          const {name, uid, source, head, tail} = appDb;
          const checkupdate = new checkManifestUpdate({name, uid, source, head, tail}, url, api_key);
          checkupdate.update()
        }
      }
    }catch(err) {
      const {url, api_key}:T.ApiKey = config.global
      if (url === "undefined" || api_key === "undefined") console.log('configure AppConfig.json location server/config/AppConfig.json')
      console.log(err)
    }
  }, 6000)
}

async function updateAppList(arr:T.App[]):Promise<T.App[] | T.error> {
  try {
    const appList:T.App[] = []
    for (let i:number=0; i < arr.length; i++) {
      const {name, uid, source} = arr[i];
      const app = await App.find({uid});
      if (app.length < 1) {
        const app:T.App = await App.create({name, uid, source});
        appList.push(app);
      }
    }
    return appList
  }catch(err){
    console.log(err)
    const error:T.error = {
      message: 'src/controllers/autoUpdate error updateAppList function error',
      status:500,
      log: `error on server side`
    }
    console.log(error)
    return []
  }
}

class checkManifestUpdate {
  apikey:string
  url: string
  time: number
  checkingManifest: boolean
  app:T.App
  intervalId: NodeJS.Timer
  revision: string
  constructor(app:T.App, url:string, api_key:string) {
    this.apikey = api_key;
    this.url = url;
    this.checkingManifest = false;
    this.app = app;
    this.time = 6000;
    this.revision;
  }
  update():string {
    if (!this.checkingManifest) {
      this.checkingManifest = true;
      this.intervalId = setInterval(async ():Promise<void> => {
        try{
          console.log('manifest check')
          if (this.app.tail !== null) {
            if (this.revision === undefined) {
              const LastNode:T.Node = await Node.findOne({_id: this.app.tail})
              const {revision} = await LastNode
              this.revision = revision
            }
          }
          const response = await fetch(`${this.url}/api/v1/applications/${this.app.name}/manifests`, {
            headers: {
              Authorization: `Bearer ${this.apikey}`
            }});
          const data = await response.json()
          // console.log("before error", data)
          const {manifests, revision, sourceType} = data
          if (this.revision !== revision) {
            console.log(manifests)
            const mani = await JSON.stringify(manifests)
            const newNode:T.Node = await addNode(undefined, {
              locals:{
                uid: this.app.uid, 
                manifest: mani,
                revision: revision,
                sourceType: sourceType
              }});
            this.revision = newNode.revision
          }
        }catch(err) {
          console.log(err)
          const error:T.error = {
            message: 'server/controller/autoUpdate checkManifestUpdate.update error',
            status: 500,
            log: 'serverside error'
          }
          console.error(error)
        }
      }, this.time)
    }
    return''
  }
}