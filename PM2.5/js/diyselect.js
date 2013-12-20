/**
 * 名称: diyselect.js
 * 描述: 用其它 HTMLElement 模拟 select
 * 属性: UI组件
 * 版本: 0.9.5
 * 依赖: jQuery ~> 1.7.2, pin ~> 0.9.0
 * 开发: wuwj
 */

var DiySelect = function (select, options) {
	options = $.extend({}, $.fn.diySelect.defaults, options);

	this.options = options;
	this.hasInit = false;

	this.init(select);
};

DiySelect.prototype = {

	constructor: DiySelect,

	init: function (select) {
		// 是否初始化且目标元素是否为 `select`
		if (this.hasInit && select.tagName.toLowerCase !== 'select') {
			return;
		}

		var id = select.id;
		this.unique(id); // 去重

		this.selectSpan = $('<span/>').addClass(this.options.selectClass).attr('id', id + '-select');
		this.optionDiv = $('<div/>').addClass(this.options.optionClass).attr('id', id + '-option');
		this.optionUl = $('<ul/>');
		this.option = $(select).find('option');
		this.optionSize = this.option.length;
		this.arrowHtml = '<i class="' + this.options.arrowClass + '"></i>';
		this.bgIframe = $('<iframe/>').addClass('bgiframe').attr('frameborder', '0');

		// 组装模拟元件
		this.setupOption();
		this.setupSelect();

		// DOM 操作：
		// 隐藏原 `select`，再其后加入模拟的 `HTMLElement`
		$(select).hide();
		this.selectSpan.insertAfter($(select));
		this.optionDiv.insertAfter(this.selectSpan).hide();

		// 初始化完成标记
		this.hasInit = true;

		var that = this;
		var active = -1;
		var list = this.optionDiv.find('li');

		// 事件绑定
		list.on('click', function (e) {
			var text = $(this).text();

			e.preventDefault();
			e.stopPropagation();

			that.chooseOption(text);
			$(select).trigger('change');
		});

		list.on('mouseenter', function () {
			list.removeClass('active');
			$(this).addClass('active');
			active = list.filter(':visible').index(this);
		});

		this.selectSpan.on('click', function (e) { 
			e.preventDefault();
			e.stopPropagation();

			// 自定义事件
			if (that.options.beforeSelect) {
				that.options.beforeSelect.apply(this);
			};

			$('.' + that.options.optionClass).hide();

			// if (that.optionVisible) {
			// 	that.hideOption();
			// } else {
			// 	that.showOption();
			// }
			that.showOption();
		});

		$(select).on('choose', function (e, text) {
			e.stopPropagation();
			that.chooseOption(text);
		});

		$(select).on('revert', function (e) {
			e.stopPropagation();
			that.revert();
		});

		// 窗口变化时调整位置
		$(window).on('resize', $.proxy(this.setPosition, this));

		// 模拟 `select` 失焦
		$(document).on('click', function () {
			if (that.optionVisible) { that.hideOption(); }
		});

		// 键盘事件
		$(document).on('keydown', function (e) {
			if (that.optionDiv.is(':visible')) {
				switch (e.keyCode) {
					case 13: // enter
						if (active !== -1) {
							var text = list.slice(active, active + 1).text();
							that.chooseOption(text);
						}

						that.hideOption();
						$(select).trigger('change');
						break;
					case 27: // esc
						that.hideOption();
						break;
					case 38: // up
						e.preventDefault();
						moveSelect(-1);
						break;
					case 40: // down
						e.preventDefault();
						moveSelect(1);
						break;
				}
			}
		});

		/**
		 * 焦点位移
		 * @param  {float} step 位移步长
		 */
		function moveSelect(step) {
			var count = list.length;

			active += step;

			if (active < 0) {
				active =  0;
			} else if (active >= count) {
				active = count - 1;
			} else {
				list.removeClass('active');
				list.slice(active, active + 1).addClass('active');

				// 出现滚动条的情况
				if ( active >= (that.options.maxSize / 2) && count > that.options.maxSize) {
					that.optionDiv.scrollTop(list.height() * (active - (that.options.maxSize / 2)));
				}
			}
		}
	},

	setupOption: function () {
		var fragment = document.createDocumentFragment();

		for (var i = 0; i < this.optionSize; i++) {
			var li = document.createElement('li');
			var value = this.option[i].value;
			var text = this.option[i].text;

			if (text == this.option[i].text()) continue;

			li.innerHTML = text;

			if (value) { 
				li.setAttribute('data-' + this.options.valueAttr, value); 
			}

			fragment.appendChild(li);
		}

		this.optionDiv.append(this.optionUl);
		this.optionUl.get(0).appendChild(fragment);
		this.optionVisible = false;
	},

	setupSelect: function () {
		var checkText = this.options.checkText || this.option.filter(':selected').text();

		// 初始选择（可设置）
		this.chooseOption(checkText);

		if (this.options.width) {
			this.selectSpan.width(this.options.width);
		}
			
		var spanStyle = this.selectSpan.attr('style');
		
		if (spanStyle) {
			spanStyle += ';' + this.options.style;
		}

		this.selectSpan.attr('style', spanStyle);
	},

	setPosition: function () {
		// 可视窗口顶部到 `selectSpan` 的距离
		var top_height = this.selectSpan.offset().top + this.selectSpan.outerHeight() - $(window).scrollTop();

		// 可视窗口剩余空间与 `optionDiv` 高度的差值
		var diff = $(window).height() - top_height - this.optionDiv.height();

		// 差值大于零，说明剩余空间还可容纳 `optionDiv`
		// `optionDiv` 就位居 `selectSpan` 正下方展示
		// 反之亦然
		if ( diff > 0 ) {
			this.optionDiv.pin({
				base: this.selectSpan,
				baseXY: [0, '100%-1px']
			});
		} else {
			this.optionDiv.pin({
				base: this.selectSpan,
				selfXY: [0, '100%-1px']
			});
		}
	},

	chooseOption: function(text) {
		this.hideOption();
		this.selectSpan.html(text + this.arrowHtml);
		// this.option.attr('selected', false);
		
		for (var i = 0; i < this.optionSize; i++) {
			if (text === this.option[i].text) {
				// 原生 `select` 跟随选择
				this.option[i].selected = true;
				break;
			}
		}

		if (this.options.afterChoose) {
			this.options.afterChoose.apply(this);
		}
	},

	showOption: function () {
		this.optionDiv.show();

		this.optionDiv.height(Math.min(this.optionDiv.height(), 
			this.optionDiv.find('li').height() * this.options.maxSize));

		this.optionDiv.css({
			'min-width': this.selectSpan.outerWidth(),
			'z-index': this.options.zIndex
		});

		this.setPosition();
		this.optionVisible = true;
	},

	hideOption: function () {
		this.optionDiv.hide();
		this.optionVisible = false;
	},

	unique: function (id) {
		if ($('#' + id + '-select')) { $('#' + id + '-select').remove(); }
		if ($('#' + id + '-option')) { $('#' + id + '-option').remove(); }
	},

	revert: function () {
		this.selectSpan.remove();
		this.optionDiv.remove();
	}
};

// 注册插件
$.fn.diySelect = function (options) {
	return this.each(function () {
		new DiySelect(this, options);
	});
};

$.fn.chooseSelect = function (value) {
	return this.trigger('choose', [value]);
};

$.fn.revertSelect = function () {
	return this.trigger('revert');
};

// 默认设置
$.fn.diySelect.defaults = {
	selectClass: 'js-select',
	optionClass: 'js-option',
	arrowClass: 'arrow',
	valueAttr: 'select-val',
	zIndex: '10000',
	offsetY: 1,
	maxSize: 6
};

$.fn.Constructor = DiySelect;