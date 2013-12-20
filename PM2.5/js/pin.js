/**
 * 名称: pin.js
 * 描述: 通过两个对象分别描述定位元素及其定位点，然后将其定位点重合
 * 属性: 工具
 * 版本: 0.9.0
 * 依赖: jQuery ~> 1.7.2
 * 开发: wuwj
 */

$.fn.pin = function (options, fixed) {
	options = $.extend({
		base: null,
		selfXY: [0, 0],
		baseXY: [0, 0]
	}, options || {});

	// 是否相对于当前可视区域（Window）进行定位
	var isViewport = !options.base,

		// 定位 fixed 元素的标志位，表示需要特殊处理
		isPinFixed = false,

		parent = this.offsetParent(),

		// 基准元素的偏移量
		offsetLeft, offsetTop,

		// 基准元素根据定位点坐标 `baseXY` 分别获得纵横两个方向上的 size
		baseX, baseY,

		// 同上，根据定位点坐标 `selfXY` 获取的横纵两个方向上的 size
		selfX, selfY,

		// 定位元素位置
		left, top;

	// 设定目标元素的 position 为绝对定位
	// 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
	if (this.css('position') !== 'fixed' || false) {
		this.css('position', 'absolute');
		isPinFixed = false;
	} else {
		isPinFixed = true;
	}

	// 修正 ie6 下 absolute 定位不准的 bug
	if (false) {
		this.css('zoom', 1);
		parent.css('zoom', 1);
	}

	// 如果不定义基准元素，则相对于当前可视区域进行定位
	if (isViewport) {
		offsetLeft = $(document).scrollLeft();
		offsetTop = $(document).scrollTop();

		baseX = getSize($(window), options.baseXY[0], 'outerWidth');
		baseY = getSize($(window), options.baseXY[1], 'outerHeight');
	} else {
		// 判断定位元素的祖先辈元素们是否被定位过，是的话用 `$.position()`，否则用 `$.offset()`
		var offsetFixed = (parent[0] === document.documentElement) ?
											options.base.offset() :
											options.base.position();

		offsetLeft = offsetFixed.left;
		offsetTop = offsetFixed.top;

		baseX = getSize(options.base, options.baseXY[0], 'outerWidth');
		baseY = getSize(options.base, options.baseXY[1], 'outerHeight');
	}

	selfX = getSize(this, options.selfXY[0], 'outerWidth');
	selfY = getSize(this, options.selfXY[1], 'outerHeight');

	// 计算定位元素位置
	// 若定位 fixed 元素，则父元素的 offset 没有意义
	left = (isPinFixed? 0 : offsetLeft) + baseX - selfX;
	top = (isPinFixed? 0 : offsetTop) + baseY - selfY;

	// 进行定位
	this.css({ left: left, top: top });
};

// 扩展：相对于当前可视区域页面上某一元素的居中定位
$.fn.pinCenter = function (options) {
	this.pin({
		base: (options) ? options.base : null,
		selfXY: ['50%', '50%'],
		baseXY: ['50%', '50%']
	});
};

/**
 * 根据坐标点获取对应尺寸值
 * @param  {jquery} object 被获取尺寸的元素
 * @param  {array}  coord  坐标点
 * @param  {string} type   尺寸类型
 * @return {number}
 */
function getSize(object, coord, type) {
	// 参考 `https://github.com/aralejs/position/blob/master/src/position.js`
	// 中的 `xyConverter` 方法
	// 先将坐标值转成字符串
	var x = coord + '';

	// 处理 alias，此处正则表达式内的 `?:` 表示此括号为非捕获型括号
	if (/\D/.test(x)) {
		x = x.replace(/(?:top|left)/gi, '0%')
					.replace(/center/gi, '50%')
					.replace(/(?:bottom|right)/gi, '100%');
	}

	// 处理 `px`
	if (x.indexOf('px') !== -1) {
		x = x.replace(/px/gi, '');
	}

	// 将百分比转为像素值
	if (x.indexOf('%') !== -1) {
		// 支持小数
		x = x.replace(/(\d+(?:\.\d+)?)%/gi, function (m, d) {
			return object[type]() * (d / 100.0);
		});
	}

	// 处理类似 100%+20px 的情况
	if (/[+\-*\/]/.test(x)) {
		try {
			x = (new Function('return ' + x))();
		} catch (e) {
			throw new Error('Invalid position value: ' + x);
		}
	}

	// 转换回数字
	return parseFloat(x, 10);
}

