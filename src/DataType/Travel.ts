export class Travel{
  doc_id: string;
  name: string;
  uid: string;

  constructor(doc_id: string, uid: string, name: string){
    this.doc_id = doc_id;
    this.uid = uid;
    this.name = name;
  }
}

export default Travel;