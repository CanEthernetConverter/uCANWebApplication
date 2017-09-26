export class CANFrame {
  timestamp;
  timestamp_diff;
  id;
  type;
  len;
  data;
  formattedTime;

  constructor(_timestamp, _timestamp_diff, _id, _type, _data, _len) {
    this.timestamp = _timestamp;
    this.timestamp_diff = _timestamp_diff;
    this.id = _id;
    this.type = _type;
    this.data = _data;
    this.len = _len;

      // calculate formattedTime
    const date = new Date(_timestamp);
    const hours = date.getHours();
    const minutes = `0${date.getMinutes()}`;
    const seconds = `0${date.getSeconds()}`;
    this.formattedTime = `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}.${date.getMilliseconds()}`; // consider to locatationstring
  }

  static fromSocketCANData(pframe) {
    const frame = JSON.parse(pframe);

    let type = 'S';

    if (frame.data.type !== 'Buffer') { type = 'E'; }

    const id = frame.id.toString(16);
    let len = 0;
    let data = '0';
    if (typeof frame.data.data !== 'undefined')	{
      len = frame.data.data.length;
      data = (frame.data.data.map(d => d.toString(16))).toString();
      data = data.replace(/,/g, '');
    }

    const timestamp = (frame.ts_sec * 1000) + Math.floor(frame.ts_usec / 1000);

    return (new CANFrame(timestamp, 0, id, type, data, len));
  }


  static formSLCANString(frame) {
    let type = 'S';
    let id = 0;
    let len = 0;
    let data = frame.substring(1, frame.lenght);

    // if (isNaN(parseInt(_id,16)) == true)
    //   return undefined;

    if (frame.substring(0, 1) === 'T') {
      type = 'E';
      id = data.substring(0, 5);
      len = data.substring(5, 6);
      data = data.substring(6, len + 6);
    } else {
      id = data.substring(0, 3);
      len = data.substring(3, 4);
      data = data.substring(4, len + 4);
    }
    return (new CANFrame(new Date().getTime(), 0, id, type, data, len));
  }

  toSocketCAN() {
    let outputString = '';

    // id
    if ((this.type === 'E') || (parseInt(this.id, 16) > 0x7FF)) // force Extended
      {
      outputString += `${this.id.toString().pad('0', 8)}#`;
    } else {
      outputString += `${this.id.toString().pad('0', 3)}#`;
    }
     // data
    outputString += this.data.pad('0', this.len * 2, 1);

    console.log(outputString);

    return outputString;
  }

  toSLCANString() {
    let nType = 't';
    if ((this.type === 'E') || (parseInt(this.id, 16) > 0x7FF)) { // force extended
      nType = 'T';
    }
    let outputString = nType;
    if (nType === 't') {  // add id padding 0 always 3 digits
      outputString += this.id.toString().pad('0', 3);
    } else { outputString += this.id.toString().pad('0', 8); }

    if (parseInt(this.len) === 0) { outputString += '0'; } else { outputString += this.len.toString(); }


    outputString += this.data.pad('0', this.len * 2, 1);

    console.log(outputString);

    return outputString;
  }

  getTime(difftimeformat) {
    if (difftimeformat) {
      return this.timestamp_diff;
    }

    return this.formattedTime;
  }
}

String.prototype.pad = function (_char, len, to) {
  if (!this || !_char || this.length >= len) {
    return this;
  }
  to = to || 0;

  let ret = this;

  let max = (len - this.length) / _char.length + 1;
  while (--max) {
    ret = (to) ? ret + _char : _char + ret;
  }

  return ret;
};
