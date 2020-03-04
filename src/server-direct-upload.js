require("dotenv").config();
const fs = require("fs");
const qiniu = require("qiniu");

const config = new qiniu.conf.Config();
const formUploader = new qiniu.form_up.FormUploader(config);
const mac = new qiniu.auth.digest.Mac(
  process.env.QINIU_AK,
  process.env.QINIU_SK
);
//要上传的空间
const BUCKET_NAME = process.env.QINIU_BUCKET_NAME;

//构建上传策略函数
function genUploadToken() {
  // 上传策略 https://developer.qiniu.com/kodo/manual/1206/put-policy
  var putPolicy = new qiniu.rs.PutPolicy({
    scope: BUCKET_NAME,
    returnBody:
      '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"name":"$(x:name)"}'
  });
  return putPolicy.uploadToken(mac);
}

//构造上传函数
function uploadFile(localFile, key /* 七牛存储的名 */) {
  const extra = new qiniu.form_up.PutExtra();
  extra.params = {
    "x:name": "peter",
    "x:age": 27
  };
  formUploader.putFile(genUploadToken(), key, localFile, extra, (err, ret) => {
    if (!err || !ret.error) {
      console.log(ret);
    } else {
      console.log(err || ret.error);
    }
  });
}

function uploadStream(key) {
  formUploader.putStream(
    genUploadToken(),
    key,
    fs.createReadStream("./a.png"),
    null,
    (respErr, respBody, respInfo) => {
      if (respErr) {
        throw respErr;
      }

      if (respInfo.statusCode == 200) {
        console.log(respBody);
      } else {
        console.log(respInfo.statusCode);
        console.log(respBody);
      }
    }
  );
}

//调用uploadFile上传
// uploadFile("./b.png");
uploadStream()
