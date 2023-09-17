import Place from "./Place";

class Travel{
  doc_id: string;
  name: string;
  uid: string;
  places: Map<string, Place>

  constructor(doc_id: string, uid: string, name: string){
    this.doc_id = doc_id;
    this.uid = uid;
    this.name = name;
    this.places = new Map<string, Place>();
  }
}

export default Travel;