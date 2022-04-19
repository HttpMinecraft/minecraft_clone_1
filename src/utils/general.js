import {isString} from './type_check.js';

export function globExport(obj, name=null){
  name = name??obj.name;
  if(name==null){
    console.error("No name");
  }
  window[name] = obj;
}
export var exportAs = globExport;

export function expectValue(v, name=null){
  name = name ?? v?.name;
  if(name==null){
    console.warn("Name not specified!");
  }
  if(v==null){
    throw new ReferenceError(`${name} must not be null!`);
  }
  return v;
}

export function nameOrValue(v, obj, name=null){
  if(isString(v)){
    return expectValue(obj[v], name==null ? name : name + '(from string)');
  }
  return expectValue(v, name);
}


export function callCallback(callback, thisArg, ...args){
  if(callback!=null){
    if(thisArg==null){
      callback(...args);
    } else{
      callback.call(thisArg, ...args);
    }
  }
}
