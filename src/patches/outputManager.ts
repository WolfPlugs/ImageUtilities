import { webpack, common } from 'replugged';

const { toast } = common
const { showToast, ToastType } = webpack.getByProps(['createToast', 'showToast'])

class outputManager {
  public constructor (startID = '') {
    this._startID = startID;
  }

  public setStartId (id) {
    this._startID = id;
  }

  public successToast (message) {
    showToast({
      type: ToastType.SUCCESS,
      message
    });
  }

  public errorToast (message) {
    showToast({
      type: ToastType.FAILURE,
      message
    });
  }

  public error (msg, addButton = {}) {
    const buttons = [
      {
        text: 'okay',
        color: 'red',
        size: (addButton) ? 'small' : 'medium',
        look: 'outlined'
      }
    ];
    if (Object.keys(addButton).length) {
      buttons.push(addButton);
    }
    this._main(msg, 'danger', buttons);
  }

  public _main (content, type, buttons) {
    const id = Math.random().toString(10).substr(2);
    toast.toast(`${this._startID}-${id}`, {
      header: 'Image Tools',
      timeout: 4e3,
      content,
      type,
      buttons
    });
  }

}
