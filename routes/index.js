var express = require('express');
var router = express.Router();
var mysql=require('mysql')
var bodyParser=require('body-parser');
var session =require('express-session');
var FileStore=require('session-file-store')(session);
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'CIGABOX'
});
router.use(bodyParser.urlencoded({extended:false})); //url인코딩 x
router.use(bodyParser.json());  //json방식으로 파
connection.connect();

router.use(session({
  secret: '209',  // 암호화
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); //main page
router.get('index', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); //main page
router.get('/main',function(req,res,next) {

  if(!req.session.logined){
    return res.render('login', {title: 'Express', message:''});
  }
  else {
    var sql='SELECT m_title,t_area, h_number, seat_n, start FROM PLAY INNER JOIN HOLE ON PLAY.h_id=HOLE.h_id  INNER JOIN RESERVED ON PLAY.p_id=RESERVED.p_id&&RESERVED.u_id=?';   //티켓
    var parameter=[req.session.logined.u_id];
    cnpm
    connection.query('SELECT * FROM THEATER', function (err, results, fields) {
      if (err) {
        console.log(err);
      }



      return res.render('main', {t_data: results, user: req.session.logined, l_data:req.session.ticket});   //영화관 선택으로
    });
  }
});






router.get('/logout',function(req,res){
  req.session.destroy();  //세션비우기
  res.redirect('/');
});
//로그아웃


router.get('/login', function(req, res, next) {
    if(req.session.logined){
      var sql='SELECT m_title,t_area, h_number, seat_n, start FROM PLAY INNER JOIN HOLE ON PLAY.h_id=HOLE.h_id  INNER JOIN RESERVED ON PLAY.p_id=RESERVED.p_id&&RESERVED.u_id=?';
      var parameter=[req.session.logined.u_id];
      connection.query(sql,parameter,function (err, row){
        if(err)
        {
          console.log("안됨");
        }

        req.session.ticket=row;

      });

      connection.query('SELECT * FROM THEATER', function (err, results, fields) {
        if (err) {
          console.log(err);
        }


        return res.render('main', {t_data: results, user:req.session.logined, l_data:req.session.ticket});
      });
    }
    else {
      return res.render('login', {title: 'Express', message:''});
    }
  });



router.post("/login", function (req, res){


  connection.query('SELECT * FROM USER', function(err, row, next) {
    if (err) {
      console.log(err);
    }
    var success=0;
    for(var a=0; a<row.length; a++){

      if(row[a].u_id==req.body.login_id&&row[a].passwd==req.body.login_pw){
        success=1;
        console.log('로그인성공');
        req.session.logined=row[a];
        var sql='SELECT m_title,t_area, h_number, seat_n, start FROM PLAY INNER JOIN HOLE ON PLAY.h_id=HOLE.h_id  INNER JOIN RESERVED ON PLAY.p_id=RESERVED.p_id&&RESERVED.u_id=?';   //db의 user data와 비교
        var parameter=[req.session.logined.u_id];
        connection.query(sql,parameter,function (err, row){
          req.session.ticket=row;

        });

        connection.query('SELECT * FROM THEATER', function (err, results, fields) {
          if (err) {
            console.log(err);
          }


          return res.render('main', {t_data: results,user:req.session.logined, l_data:req.session.ticket});
        });
      }
    }
    if(success==0) {

      return res.render('login',{message:1});
    }
  });
});

router.get('/signup',function(req,res){
  res.render('signup',{message:''});  //회원가입
});

router.post("/signup", function(req,res) {


  connection.query('SELECT * FROM USER', function (err, row, next) {
    var success = 1;
    if (err) {
      console.log(err);
    }
    for (var a = 0; a < row.length; a++) {

      if (row[a].u_id == req.body.sign_id) {
        success = 0;
        console.log('동일 id 발생');
        return res.render('signup', {message: 1});
      }
      if (row[a].passwd == req.body.sign_pw) {
        success = 0;
        console.log('동일 pw발생');
        return res.render("signup", {message: 2});
      }
      if (!req.body.sign_pw || !req.body.sign_id || !req.body.sign_age || !req.body.sign_name) {
        success = 0;
        console.log('빈칸있음');
        return res.render("signup", {message: 3});
      }
    //예외처리
    }
    console.log(success);
    if (success = 1) {
      var sql = 'INSERT INTO USER(u_id, passwd, age, name) VALUES(?,?,?,?)';
      var parameter = [req.body.sign_id, req.body.sign_pw, req.body.sign_age, req.body.sign_name];
      connection.query(sql, parameter, function (err, row) {
        if (err) {
          console.log(err);
        }

        console.log('회원가입성공');
        return res.render("signup", {message: 4});
      });
    }
  });
});

router.post("/main", function (req,res){

  connection.query('SELECT * FROM THEATER', function (err, results, fields) {
    if (err) {
      console.log(err);
    }
    var i=0;
    for(i; i<results.length; i++)
    {
      if(results[i].t_area==req.body.area)
      {
        break;
      }
    }
    console.log(new Date())
    console.log('성공');
    req.session.theater=results[i];
    connection.query('SELECT * FROM MOVIE', function (err, results, fields) {
      if (err) {
        console.log(err);
      }



      return res.render('movie', {m_data: results, user: req.session.logined, l_data:req.session.ticket});
    });
  });
});

router.get('/movie',function(req,res,next) {

    connection.query('SELECT * FROM MOVIE', function (err, results, fields) {
      if (err) {
        console.log(err);
      }



      return res.render('movie', {m_data: results, user: req.session.logined, l_data:req.session.ticket});
    });

});

router.post("/movie", function (req,res){


  connection.query('SELECT * FROM MOVIE', function (err, results, fields) {
    if (err) {
      console.log(err);
    }
    var i=0;
    for(i; i<results.length; i++)
    {
      if(results[i].m_title==req.body.title)
      {
        break;
      }
    }

    console.log(req.body.title);
    req.session.movie=results[i];
    var sql='SELECT P.p_id, P.m_title, P.start , P.price, 40-P.people AS people, H.t_area, H.h_number FROM (SELECT * FROM PLAY WHERE m_title=?) AS P JOIN (SELECT * FROM HOLE WHERE t_area=?) AS H WHERE P.h_id=H.h_id';  //상영리스트 뽑아오기
    var par=[req.session.movie.m_title,req.session.theater.t_area];
    connection.query(sql,par, function (err, results, fields) {
      if (err) {
        console.log(err);
      }
      console.log(results);

      return res.render('select', {p_data: results, user: req.session.logined, l_data:req.session.ticket});
    });
  });
});

router.get('/select',function(req,res,next) {
  connection.query("UPDATE PLAY SET price=7000+1000*(people/40)",function (err,row){
    console(req.session.movie.m_title,req.session.theater.t_area);
  });

  var sql='SELECT P.p_id, P.m_title, P.start , P.price, 40-P.people AS people, H.t_area, H.h_number FROM (SELECT * FROM PLAY WHERE m_title=?) AS P JOIN (SELECT * FROM HOLE WHERE t_area=?) AS H WHERE P.h_id=H.h_id';
  var par=[req.session.movie.m_title,req.session.theater.t_area];
  connection.query(sql,par, function (err, results, fields) {
    if (err) {
      console.log(err);
    }
    console.log(results);


    return res.render('select', {p_data: results, user: req.session.logined, l_data:req.session.ticket});
  });

});
router.post('/select',function (req,res){


    console.log('성공');
    req.session.p=req.body.data;
    console.log(req.session.p);
    return res.send({});

});
module.exports = router;

router.get('/reserve',function(req, res){
  var sql='SELECT * FROM RESERVED WHERE p_id=?'
  var parameter=[req.session.p];
  connection.query(sql,parameter, function (err,row){
    console.log(row);
    return res.render('reserve', {s_data: row, user: req.session.logined, l_data:req.session.ticket});
  });
});

router.post('/reserve',function(req, res){
  console.log(req.body.c_seat);

      var sql='INSERT INTO RESERVED(u_id,p_id,seat_n) VALUE(?,?,?)'
      var parameter=[req.session.logined.u_id,req.session.p,req.body.c_seat];
      connection.query(sql, parameter, function (err, row){
        console.log(row);
      });





  var sql='UPDATE PLAY SET people=people+1 where p_id=?';
  var parameter=[req.session.p];
  connection.query(sql, parameter, function (err, row){
    console.log(row);
  });

  connection.query("UPDATE PLAY SET price=7000+1000*(people/40)",function (err,row){  //가격 할인
    console.log("할인시작");
  });
  var sql='SELECT m_title,t_area, h_number, seat_n, start FROM PLAY INNER JOIN HOLE ON PLAY.h_id=HOLE.h_id  INNER JOIN RESERVED ON PLAY.p_id=RESERVED.p_id&&RESERVED.u_id=?';
  var parameter=[req.session.logined.u_id];
  connection.query(sql,parameter,function (err, row){
    console.log(row);
    return res.render('result',{r_data:row,user:req.session.logined})
  });

});

router.get('/result', function (req,res){
  var sql='SELECT m_title,t_area, h_number, seat_n, start FROM PLAY INNER JOIN HOLE ON PLAY.h_id=HOLE.h_id  INNER JOIN RESERVED ON PLAY.p_id=RESERVED.p_id&&RESERVED.u_id=?'
  var parameter=[req.session.logined.u_id];
  connection.query(sql,parameter,function (err, row){
    if(err){
      console.log(err);
    }
    console.log(row);
    return res.render('result',{r_data:row,user:req.session.logined})
  });
});