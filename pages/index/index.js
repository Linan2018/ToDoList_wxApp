//index.js

const app = getApp()

Page({
  data: {
    tabOptions: ['全部', '待办', '已完成'],
    currentTabIndex: 0,
    list: [],
    complete: 0,
    array: ['高', '中', '低'],
    prilist: ['!!!', '!!', '!'],
    objectArray: [
      {
        id: '0',
        name: '高'
      },
      {
        id: '1',
        name: '中'
      },
      {
        id: '2',
        name: '低'
      }
    ],

    index: 0,
    date: '2020-01-01',
    time: '00:00',
    inputValue: '',
    id: 0,

    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    user: ''
  },
  onTabChange(e) {
    // 接受来自组件传递的参数
    const detail = e.detail
    this.setData({
      currentTabIndex: detail.activedTab
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  compare: function (prop) {
    return function (obj1, obj2) {
      var val1 = obj1[prop];
      var val2 = obj2[prop];
      if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
        val1 = Number(val1);
        val2 = Number(val2);
      }
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        return 0;
      }
    }
  },

  sortlist: function (array) {
    console.log(array)
    array = array.sort(this.compare("pri"));
    // array = array.sort(this.compare("data"));
    this.setData({
      list: array
    });
    console.log(this_.data.list);
  },

  getall: function () {
    var this_ = this;
    const db = wx.cloud.database();
    var list = [];
    db.collection('todos').where({
      user: this_.data.user
    })
      .get({
        success: function (res) {
          // console.log(res.data);
          this_.sortlist(res.data);
          // this_.setData({
          //   list: res.data
          // });
          console.log(this_.data.list);
          this_.com_task();
        }
      });

    // console.log("getall", this.data.list);
  },

  onLoad: function (options) {
    wx.showToast({
      title: '正在同步数据',
      icon: 'loading',
      duration: 1000,
      mask: true
    });
    this.getinfo();
    this.setData({
      user: this.data.userInfo.nickName
    });
    console.log("user:", this.data.user);
    wx.cloud.init();
    this.getall();
  },

  add: function () {
    // console.log(this.data.list);
    if (this.data.inputValue == '') {
      wx.showToast({
        title: '请输入任务名称',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    var e = {
      checked: false,
      value: this.data.inputValue,
      pri: this.data.index,
      date: this.data.date,
      time: this.data.time,
      user: this.data.user
    };
    this.setData({
      value:''
    });
    var this_ = this;
    const db = wx.cloud.database();
    db.collection('todos').add({
      // data 字段表示需新增的 JSON 数据
      data: e
    })
      .then(res => {
        // console.log(res);
        this_.getall();
        wx.showToast({
          title: '添加成功',
          icon: 'succes',
          duration: 800,
          mask: true
        });
      });
    this.com_task();

  },
  remove: function (e) {
    const id = this.data.list[e.target.dataset.index]._id;
    const this_ = this;
    const db = wx.cloud.database();
    db.collection('todos').doc(String(id)).remove({
      success: function (res) {
        // console.log("res", res.data);
        this_.getall();
      }
    })
    this.com_task();
  },
  change: function (e) {
    // console.log(e);
    const id = this.data.list[e.target.dataset.index]._id;
    const this_ = this;
    wx.cloud.init();
    const db = wx.cloud.database();
    db.collection('todos').doc(String(id)).update({
      // data 传入需要局部更新的数据
      data: {
        checked: !!e.detail.value[0]
      },
      success: function (res) {
        // console.log(res.data);
        this_.getall();
      }
    });
    this.com_task();
  },
  com_task: function () {
    var complete = 0, list = this.data.list;
    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i].checked != false) {
        complete++;
      }
    }
    this.setData({
      complete: complete
    });
  },

  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    });
  },

  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    });
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    });
  },
  getinfo: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  }
})