![vodplayer.js](http://p1.img.cctvpic.com/photoAlbum/page/performance/img/2018/7/2/1530523851457_510.png)
## 说明

* 本项目用于线上点播调度文件[vodplayer.js](http://js.player.cntv.cn/creator/vodplayer.js)的阶段性维护，191212复制线上点播调度js文件。
WH自该版本开始逐步接手此文件更新维护，由于不清楚此文件牵涉到多大范围及后续WNH是否还会对改文件进行修改，于是建立该项目，方便协同工作。
* 此文件既涉及到flash点播的调用调度又关系到H5的PC点播和移动端H5点播，本项目只关注flash版本的调度、整合、淘汰。新开发H5版本播放器的开发进度流可查看 [h5vod.git](https://github.com/zzyyxxaabbccoo/h5vod.git) 私有项目，的页面可查看 [这里 需链接VPN](http://jstest.v.cntv.cn/h5vod/h5vod.html)
* H5点播上线稳定后会和本项目合并，并行维护。


## 概要
* 目前线上播放器版本（全部是flash版）：
 *  1、大网老版点播（2.x）   最新版本 [cntv player QC.2.4.5.191212](http://player.cntv.cn/standard/cntvplayerQC20181126.swf?v=0.171.5.8.9.6.3.5.2)
 *  2、大网新版点播（3.x）   最新版本 [cntv player QC.3.1.4.191127](http://player.cntv.cn/standard/cntvplayerQC20190719.swf?v=2019.07.02)
 *  3、党员网点播（专用UI）   最新版本 [dangyuan player 2.1.20.190703](http://player.cntv.cn/standard/dangyuanplayer20180701.swf?v=dy.1.0.4)
 *  4、熊猫频道点播（专用UI） 最新版本 [cntv player ipanda.2.2.2.190403](http://player.cntv.cn/standard/ipandaplayerVOD171121.swf?v=0.171.5.8.9.6.3.5.2)
 *  5、网春专版点播（专用UI）
 *  6、4K专版点播（专用UI）
* 此文件vodplayer.js目前只调度新版点播（3.x），如果更老版本的点播js还有维护可以一并加入本项目维护，请查看log。
* 所有开发人员都已本项目的最终版本为准。***其他开发人员，修改维护此文件时，务必先pull最新master版本，测试无误并上线后，也务必提出修改请求合并版本，避免线上版本混乱!***


## 有问题随时反馈

* 钉钉
* 邮件(wanghe#staff.cntv.cn, 把#换成@)


## 关于

```javascript
  var ihubo = {
    nickName  : "wh",
    url : "http://js.player.cntv.cn/creator/vodplayer.js"
  }
```
