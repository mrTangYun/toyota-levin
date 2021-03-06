var animationBomb = null;
var disappearSoundID = "disappear";
var carSoundID = "car";
createjs.Sound.registerSound("./image/p7/xiaoshi/hit.mp3", disappearSoundID);
createjs.Sound.registerSound("./image/p7/xiaoshi/car.mp3", carSoundID);

function Game() {
	//游戏开始前的倒计时
	this.icountDown = 3;
	//游戏时间(秒)
	this.gameTime = 15;
	//游戏中同时出现的车的数量
	this.maxCarNumber = 1;

	this.stage = null;
	this.animationBomb = null;
	this.canvas = document.getElementById("bgCanvas");
	this.ctx = this.canvas.getContext("2d");
	this.canvases = [this.canvas];
	this.ctxes = [];
	this.cars = [];
	this.carsplaying = [];
	this.loadPic = new Image();
	this.WIDTH = 0;
	this.HEIGHT = 0;
	this.iscore = 0;
	this.touch = {
		x: null,
		y: null,
		isParessed: false
	};
	this._gameTime = this.gameTime * 1000;
	this._gameRunning = false;
	this._gameRunningTimeStart = null;
	this.init = function() {
		var that = this;
		$("body").append('<input type="file" accept="image/*" capture="camera" id="hiddenCamera" style="display:none">');
		that.WIDTH = $(window).outerWidth();
		that.HEIGHT = $(window).outerHeight()

		$("#bgCanvas").after('<canvas id="canvas-0" class="game-canvas"></canvas><canvas id="canvas-1" class="game-canvas"></canvas><canvas id="canvas-2" class="game-canvas"></canvas><canvas id="canvas-3" class="game-canvas"></canvas><canvas id="canvas-4" class="game-canvas"></canvas><canvas id="canvas-5" class="game-canvas"></canvas>');
		that.canvases.push(document.getElementById("canvas-0"));
		that.canvases.push(document.getElementById("canvas-1"));
		that.canvases.push(document.getElementById("canvas-2"));
		that.canvases.push(document.getElementById("canvas-3"));
		that.canvases.push(document.getElementById("canvas-4"));
		that.canvases.push(document.getElementById("canvas-5"));

		for (var i = 0; i < that.canvases.length; i++) {
			that.canvases[i].width = that.WIDTH;
			that.canvases[i].height = that.HEIGHT;
			that.ctxes.push(that.canvases[i].getContext("2d"));
		}
		that.bindEvent();

		//创建一个阶段，得到一个参考的画布
		that.stage = new createjs.Stage("canvas-5");
		// circle = new createjs.Shape();
		// circle.graphics.beginFill("red").drawCircle(0, 0, 40);
		// //形状实例的设置位置
		// circle.x = circle.y = 50;
		//添加形状实例到舞台显示列表
		//stage.addChild(circle);

		var data = {
			images: ["image/p7/xiaoshi/b.png"],
			frames: {
				width: 138,
				height: 100,
				count: 11,
				regX: 69,
				regY: 50,
				spacing: 0,
				margin: 0
			},
			animations: {
				bomb: [0, 10]
			}
		};
		var spriteSheet = new createjs.SpriteSheet(data);
		animationBomb = new createjs.Sprite(spriteSheet);
		animationBomb.x = animationBomb.y = 100;
		animationBomb.scaleX = animationBomb.scaleY = 1;
		animationBomb.visible = false;
		animationBomb.addEventListener('animationend', function() {
			//console.log("播放完毕");
			animationBomb.visible = false;
			animationBomb.stop();
		});
		that.stage.addChild(animationBomb);
		//that.animationBomb = animationBomb;

		//animationBomb.gotoAndPlay(0);
		//更新阶段将呈现下一帧
		//stage.update();
		createjs.Ticker.addEventListener('tick', tick); //刷新
		createjs.Ticker.setFPS(10); //每秒调用tick函数 3次 控制动画快慢
		function tick(e) { //tick函数
			that.stage.update(event); //更新舞台 
		}
	};

	this.bindEvent = function() {
		var that = this;

		$("#btn-getLottery").click(function(event) {
			if (that.iscore > 0) {
				console.log("跳转")
			} else {
				return false;
			}

		});
		$("#btn-playAgain").click(function(event) {
			/* Act on the event */
			//console.log("hello")
			$(".page-9 .container").removeClass('show');
			$("#gameOverPopWindow").hide();
			//第1步，删除3秒倒计时。
			that._start_step_0();
			//第2步，出现倒计时和记分牌。
			that._start_step_1();

			that.gameAgain();
		});
		that.loadPic.onload = function(e) {
			var img = this;
			var WIDTH = that.WIDTH,
				HEIGHT = that.HEIGHT,
				imgWidth = img.width,
				imgHeight = img.height,
				rC = WIDTH / HEIGHT,
				rI = imgWidth / imgHeight,
				w,
				y,
				cImg = {
					w: WIDTH,
					h: HEIGHT
				};
			if (rC > rI) {
				//如果图片的长宽比比canvas的小
				h = WIDTH / rI;
				cImg.y = (HEIGHT - h) / 2;
				cImg.x = 0;
				cImg.h = h;
				cImg.f = 1;
			} else if (rC < rI) {
				//如果图片的长宽比比canvas的大
				w = HEIGHT * rI;
				cImg.x = (WIDTH - w) / 2;
				cImg.y = 0;
				cImg.w = w;
				cImg.f = 2;
			}
			//console.log(img, cImg.x, cImg.y, cImg.w, cImg.h);
			//
			that.ctx.save();
			that.ctx.translate(that.WIDTH, 0);
			that.ctx.rotate(90 * Math.PI / 180);

			that.ctx.drawImage(img, cImg.x + 50, cImg.y, cImg.w + 50, cImg.h);
			//that.ctx.drawImage(img, 0, 0, cImg.w, cImg.h);
			//that.ctx.drawImage(img, cImg.x, cImg.y, cImg.w, cImg.h, 0, 0, WIDTH, HEIGHT);
			that.ctx.restore();
		}
		$("#hiddenCamera").on('change', function(event) {
			event.preventDefault();
			/* Act on the event */
			var file = $(this)[0].files[0];

			//图片方向角 added by lzk  
			var Orientation = null;

			if (file) {
				console.log("正在上传,请稍后...");
				var rFilter = /^(image\/jpeg|image\/png)$/i; // 检查图片格式 
				if (!rFilter.test(file.type)) {
					//showMyTips("请选择jpeg、png格式的图片", false); 
					return;
				}
				// var URL = URL || webkitURL; 
				//获取照片方向角属性，用户旋转控制 
				EXIF.getData(file, function() {
					// //alert(EXIF.pretty(this)); 
					EXIF.getAllTags(this);
					////alert(EXIF.getTag(this, 'Orientation'));  
					Orientation = EXIF.getTag(this, 'Orientation');
					//return; 
				});

				var oReader = new FileReader();
				oReader.onload = function(e) {
					//var blob = URL.createObjectURL(file); 
					//_compress(blob, file, basePath); 
					var image = new Image();
					image.src = e.target.result;
					image.onload = function() {
						var expectWidth = this.naturalWidth;
						var expectHeight = this.naturalHeight;

						if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 800) {
							expectWidth = 800;
							expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;
						} else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 1200) {
							expectHeight = 1200;
							expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;
						}
						var canvas = document.createElement("canvas");
						var ctx = canvas.getContext("2d");
						canvas.width = expectWidth;
						canvas.height = expectHeight;
						ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
						var base64 = null;
						//修复ios 
						if (navigator.userAgent.match(/iphone/i)) {
							console.log('iphone');
							////alert(expectWidth + ',' + expectHeight); 
							//如果方向角不为1，都需要进行旋转 added by lzk 
							if (Orientation != "" && Orientation != 1) {
								//alert('旋转处理');
								switch (Orientation) {
									case 6: //需要顺时针（向左）90度旋转 
										//alert('需要顺时针（向左）90度旋转');
										rotateImg(this, 'left', canvas);
										break;
									case 8: //需要逆时针（向右）90度旋转 
										//alert('需要顺时针（向右）90度旋转');
										rotateImg(this, 'right', canvas);
										break;
									case 3: //需要180度旋转 
										//alert('需要180度旋转');
										rotateImg(this, 'right', canvas); //转两次 
										rotateImg(this, 'right', canvas);
										break;
								}
							}

							/*var mpImg = new MegaPixImage(image); 
							mpImg.render(canvas, { 
							    maxWidth: 800, 
							    maxHeight: 1200, 
							    quality: 0.8, 
							    orientation: 8 
							});*/
							base64 = canvas.toDataURL("image/jpeg", 0.8);
						} else if (navigator.userAgent.match(/Android/i)) { // 修复android 
							var encoder = new JPEGEncoder();
							base64 = encoder.encode(ctx.getImageData(0, 0, expectWidth, expectHeight), 80);
						} else {
							////alert(Orientation); 
							if (Orientation != "" && Orientation != 1) {
								////alert('旋转处理'); 
								switch (Orientation) {
									case 6: //需要顺时针（向左）90度旋转 
										//alert('需要顺时针（向左）90度旋转');
										rotateImg(this, 'left', canvas);
										break;
									case 8: //需要逆时针（向右）90度旋转 
										//alert('需要顺时针（向右）90度旋转');
										rotateImg(this, 'right', canvas);
										break;
									case 3: //需要180度旋转 
										//alert('需要180度旋转');
										rotateImg(this, 'right', canvas); //转两次 
										rotateImg(this, 'right', canvas);
										break;
								}
							}

							base64 = canvas.toDataURL("image/jpeg", 0.8);
						}
						//uploadImage(base64);
						// 
						//$("#myImage").attr("src", base64);
						$(".page-5").css({
							'background-image': 'url(' + base64 + ')'
						});
						$(".page-4").remove();
						$(".page-5").show();
						that.start();
					};
				};
				oReader.readAsDataURL(file);
			}
		});

	};
	this.showCamera = function() {
		$("#hiddenCamera").click();
	};

	this.start = function() {
		var that = this;
		that.countDown(that._start.bind(that));
	};
	this.countDown = function(callback) {
		var that = this;
		$("#buttonArea").hide();
		$("#tipsStartText,#floatCountDown").show();
		var _i = that.icountDown;
		var _c = function() {
			$("#countDownTips,#countDownSpan").text(_i);
			setTimeout(function() {
				_i--;
				if (_i > 0) {
					_c();
				} else {
					if (callback) {
						callback();
					}
				}
			}, 1000);
		};
		_c();
	};
	this.showScore = function() {
		$("#myScore").text(this.iscore >= 10 ? this.iscore : 0 + this.iscore.toString());
	};

	this._touchstartHandler = function(event) {
		var x, y,
			touch_event = event.touches[0]; //first touch

		if (touch_event.pageX || touch_event.pageY) {
			x = touch_event.pageX;
			y = touch_event.pageY;
		} else {
			x = touch_event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = touch_event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		//x -= this.target.offsetLeft;
		//y -= this.target.offsetTop;

		this.touch.isParessed = true;
		this.touch.x = x;
		this.touch.y = y;

		//console.log(touch.x, touch.y);
	};
	this._touchendHandler = function(event) {
		this.touch.isParessed = false;
	};
	this._start = function() {
		var that = this;
		//第1步，删除3秒倒计时。
		that._start_step_0();
		//第2步，出现倒计时和记分牌。
		that._start_step_1();

		//第3步，游戏部分

		//
		var json =
			[{
				totalTime: 1300,
				car: {
					startState: {
						w: .661,
						x: 1.2,
						y: 1
					},
					endState: {
						w: .54,
						x: -1.5,
						y: .62
					}
				},
				animal: 2
			}, {
				totalTime: 1000,
				car: {
					startState: {
						w: .696,
						x: -1,
						y: .72
					},
					endState: {
						w: .6,
						x: 1.5,
						y: .75
					}
				},
				animal: 3
			}, {
				totalTime: 1150,
				car: {
					startState: {
						w: .496,
						x: 1,
						y: .62
					},
					endState: {
						w: .4,
						x: -1.5,
						y: .65
					}
				},
				animal: 3
			}, {
				totalTime: 1300,
				car: {
					startState: {
						w: .526,
						x: -.3,
						y: .02
					},
					endState: {
						w: .7,
						x: 1.5,
						y: .70
					}
				},
				animal: 2
			}, {
				totalTime: 1250,
				car: {
					startState: {
						w: .33,
						x: 1,
						y: .22
					},
					endState: {
						w: .8,
						x: -1.5,
						y: .75
					}
				},
				animal: 2
			}];
		for (var i = 0; i < json.length; i++) {
			that.cars.push(new that.car(that.canvases[i + 1], that.ctxes[i + 1], i, {
				width: that.WIDTH,
				height: that.HEIGHT
			}, json[i].car.startState, json[i].car.endState, json[i].totalTime, json[i].animal));
		}
		for (var i = 0; i < that.cars.length; i++) {
			that.cars[i].init();
		}


		//最上面一层添加事件
		that.canvases[that.canvases.length - 1].addEventListener('touchstart', that._touchstartHandler.bind(that), false);
		that.canvases[that.canvases.length - 1].addEventListener('touchend', that._touchendHandler.bind(that), false);

		that._gameRunning = true;
		that._gameRunningTimeStart = null;

		that.gameRun();
	};


	this.gameRun = function() {
		var that = this;
		(function drawFrame() {
			if (!that._gameRunning) {
				return false;
			}
			window.requestAnimationFrame(drawFrame);
			if (that._gameRunningTimeStart) {
				var nowDate = new Date();
				var restTime = that._gameTime - (nowDate - that._gameRunningTimeStart);
				that.formatTime(restTime);
				if (restTime <= 0) {
					that._gameRunning = false;
					that._gameRunningTimeStart = null;
					that.carsplaying = [];
					for (var i = 0; i < that.cars.length; i++) {
						that.cars[i].isPlaying = false;
					}
					that.gameOver();
					return false;
				}
			}
			for (var i = 0; i < that.cars.length; i++) {
				//图片还没有加载完毕的时候，不运行
				if (that.cars[i].ready) {
					if (!that._gameRunningTimeStart) {
						that._gameRunningTimeStart = new Date();
					}
					if (!that.cars[i].isPlaying) {
						//判断是否要加入播放列表
						//that.carsplaying.push();
						if (that.carsplaying.length < that.maxCarNumber) {
							if (Math.random() < .3) {
								that.carsplaying.push(i);
								that.cars[i].start();

								createjs.Sound.play(carSoundID);
							}
						}
					} else {
						//把播放列表中的项目进行更新
						//console.log(i, that.cars[i].isPlaying);
						if ($.inArray(i, that.carsplaying) > -1) {
							that.cars[i].update(that.carsplaying);
						}
					}
				}
			}
			that.hitTest();
		}());
	};

	this.formatTime = function(time) {
		time = time > 0 ? time : 0;
		var m = Math.floor(time / 1000);
		m = m >= 10 ? m : '0' + m.toString();
		//console.log(m);
		$("#timerGameM").text(m);
		var s = Math.floor(time % 1000 / 10);
		s = s >= 10 ? s : '0' + s.toString();
		$("#timerGameS").text(s);
	};

	this.gameOver = function() {
		var that = this;
		for (var i = 1; i < that.ctxes.length - 1; i++) {
			that.ctxes[i].clearRect(0, 0, that.WIDTH, that.HEIGHT);
		}
		if (that.iscore > 0) {
			$("#btn-getLottery").show();
		} else {
			$("#btn-getLottery").hide();
		}
		$("#popScore").text(that.iscore);
		$("#gameSore,#timerGame").hide();
		$("#gameOverPopWindow").show();
		setTimeout(function() {
			$(".page-9 .container").addClass('show');
		}, 1)
	};

	this.gameAgain = function() {
		var that = this;
		that._gameRunning = true;
		that.iscore = 0;
		that.gameRun();
		//console.log(that);
	};

	this.hitTest = function() {
		var that = this;
		if (!that.touch.isParessed) {
			return false;
		}
		//console.log(that.touch);
		for (var i = 1; i < that.ctxes.length - 1; i++) {
			if (that.cars[i - 1].isClicked) {
				continue;
			}
			var imgData = that.ctxes[i].getImageData(that.touch.x, that.touch.y, 1, 1);
			var hasHit = false;
			for (var j = 0; j < 4; j++) {
				if (imgData.data[j] > 0) {
					hasHit = true;
					break;
				}
			}
			if (hasHit) {
				//console.log(i);
				//得分
				that.iscore++;
				that.showScore();
				that.cars[i - 1].isClicked = true;
				break;
			}
		}
	};

	this.car = function(canvas, ctx, folderIndex, stage, startState, endState, totalTime, animalNumber) {
		//初始状态
		this.startState = {
			w: stage.width * startState.w,
			x: stage.width * startState.x,
			y: stage.height * startState.y,
			h: 0,
		};
		//结束状态
		this.endState = {
			w: stage.width * endState.w,
			x: stage.width * endState.x,
			y: stage.height * endState.y,
			h: 0
		};
		this.isClicked = false;
		this.clickDiff = -.5;
		this._clickDiff = this.clickDiff;
		this._animalIndex = 0;
		this._animalNumber = animalNumber;
		this._folderIndex = folderIndex;
		this._totalTime = totalTime;
		this._timerStart = 0;
		this._folder = 'image/p7/car-' + folderIndex.toString() + '/';
		this._ctx = ctx;
		this.carImgUrl = this._folder + 'car.png';
		this.carImg = new Image();
		this.carImges = [];
		this.isPlaying = false;
		this.stage = stage;
		this.ready = false;
		this.readyNumber = 0;
		this.w = 0;
		this.h = 0;
		this.rI = 0;
		this._state = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
		this.state = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};

		this.init = function() {
			var that = this;
			for (var i = 0; i < that._animalNumber; i++) {
				that.carImges.push(new Image());
				that.carImges[that.carImges.length - 1].onload = function() {
					var rI = this.width / this.height;
					that.rI = rI;
					//把百分比转化为像素
					that.startState.h = that.startState.w / rI;
					that.endState.h = that.endState.w / rI;

					that.readyNumber++;
					if (that.readyNumber == that._animalNumber) {
						that.ready = true;
					}
				}
			}

			for (var i = 0; i < that._animalNumber; i++) {
				that.carImges[i].src = that._folder + i + '.png';
			}
			return false;
		};
		this.start = function() {
			var that = this;

			that._animalIndex = parseInt(Math.random() * (that._animalNumber), 10);
			that.isClicked = false;
			that.isPlaying = true;
			that._clickDiff = that.clickDiff;
			that.state = {
				x: that.startState.x,
				y: that.startState.y,
				w: that.startState.w,
				h: that.startState.h
			};
			that._state = {
				x: that.state.x,
				y: that.state.y,
				w: that.state.w,
				h: that.state.h
			};
			that._timerStart = new Date();
			that.draw();

		};

		this.update = function(arrayCarsplaying) {
			var that = this;
			var _timerNow = new Date();
			//console.log(that._folderIndex);
			var ctx = that._ctx;
			if (that.isClicked) {
				ctx.clearRect(0, 0, that.stage.width, that.stage.height);
				if (animationBomb) {
					//console.dir(animationBomb);
					animationBomb.x = that.state.x;
					animationBomb.y = that.state.y;
					animationBomb.visible = true;
					animationBomb.gotoAndPlay(0);
					createjs.Sound.stop(carSoundID);
					createjs.Sound.play(disappearSoundID);
				}
				that.isPlaying = false;
				arrayCarsplaying.splice($.inArray(that._folderIndex, arrayCarsplaying), 1);
				return false;
			}
			if (_timerNow - that._timerStart > that._totalTime) {
				that.isPlaying = false;
				createjs.Sound.stop(carSoundID);
				arrayCarsplaying.splice($.inArray(that._folderIndex, arrayCarsplaying), 1);
				ctx.clearRect(0, 0, that.stage.width, that.stage.height);
			} else {
				that._state = {
					x: that.state.x,
					y: that.state.y,
					w: that.state.w,
					h: that.state.h
				};
				var _i = (_timerNow - that._timerStart) / that._totalTime;
				that.state.w = that.startState.w + (that.endState.w - that.startState.w) * _i;
				that.state.h = that.startState.h + (that.endState.h - that.startState.h) * _i;
				that.state.x = that.startState.x + (that.endState.x - that.startState.x) * _i;
				that.state.y = that.startState.y + (that.endState.y - that.startState.y) * _i;
				that.draw();
			}
		};

		this.draw = function() {
			var that = this;
			var ctx = that._ctx,
				state = that.state;
			_lastState = that._state;
			//console.log(state)
			ctx.clearRect(_lastState.x - _lastState.w / 2, _lastState.y - _lastState.h / 2, _lastState.w, _lastState.h);
			//画车
			ctx.save();
			ctx.translate(state.x, state.y);
			var index = that._animalIndex;
			ctx.drawImage(that.carImges[index], 0, 0, that.carImges[index].width, that.carImges[index].height, state.w / -2, state.h / -2, state.w, state.h);

			ctx.restore();
		}
	}


	this._start_step_0 = function() {
		$("#floatCountDown,#page5BottomTips").hide();
	};
	this._start_step_1 = function() {
		$("#myScore").text("00");
		$("#gameSore,#timerGame").show();

	};
}
jQuery(document).ready(function($) {
	var game = new Game();
	game.init();

	$(".btn_Camera,#btnCancel").click(function(event) {
		/* Act on the event */
		game.showCamera();
	});

	$("#btnOk").click(function(event) {
		/* Act on the event */
		//game.start();
		// if (false) {

		// } else {

		// 	game.loadPic.src = "./image/game.jpg";
		// 	game._start();
		// }
	});

	// if (false) {

	// } else {

	// 	game.loadPic.src = "./image/game.jpg";
	// 	game._start();
	// }


});


//对图片旋转处理
function rotateImg(img, direction, canvas) {
	////alert(img); 
	//最小与最大旋转方向，图片旋转4次后回到原方向   
	var min_step = 0;
	var max_step = 3;
	//var img = document.getElementById(pid);   
	if (img == null) return;
	//img的高度和宽度不能在img元素隐藏后获取，否则会出错   
	var height = img.height;
	var width = img.width;
	//var step = img.getAttribute('step');   
	var step = 2;
	if (step == null) {
		step = min_step;
	}
	if (direction == 'right') {
		step++;
		//旋转到原位置，即超过最大值   
		step > max_step && (step = min_step);
	} else {
		step--;
		step < min_step && (step = max_step);
	}
	//img.setAttribute('step', step);   
	/*var canvas = document.getElementById('pic_' + pid);   
	if (canvas == null) {   
	    img.style.display = 'none';   
	    canvas = document.createElement('canvas');   
	    canvas.setAttribute('id', 'pic_' + pid);   
	    img.parentNode.appendChild(canvas);   
	}  */
	//旋转角度以弧度值为参数   
	var degree = step * 90 * Math.PI / 180;
	var ctx = canvas.getContext('2d');
	switch (step) {
		case 0:
			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(img, 0, 0);
			break;
		case 1:
			canvas.width = height;
			canvas.height = width;
			ctx.rotate(degree);
			ctx.drawImage(img, 0, -height);
			break;
		case 2:
			canvas.width = width;
			canvas.height = height;
			ctx.rotate(degree);
			ctx.drawImage(img, -width, -height);
			break;
		case 3:
			canvas.width = height;
			canvas.height = width;
			ctx.rotate(degree);
			ctx.drawImage(img, -width, 0);
			break;
	}
}