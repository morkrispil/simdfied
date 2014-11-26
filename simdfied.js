(function() {
var simdfied = {
	version : "1.0.1"
};

// polyfill
if (typeof (SIMD) == "undefined") {
	console.log("SIMD is not natively supported in this browser (try firefox nightly). generating required SIMD polyfill");
	SIMD = {};
	SIMD.float32x4 = function(_x, _y, _z, _w) {
		return {
			x : parseFloat(_x),
			y : parseFloat(_y),
			z : parseFloat(_z),
			w : parseFloat(_w)
		};
	}
	SIMD.float32x4.zero = function() {
		return {
			x : 0,
			y : 0,
			z : 0,
			w : 0
		};
	}
	SIMD.float32x4.add = function(s1, s2) {
		return {
			x : s1.x + s2.x,
			y : s1.y + s2.y,
			z : s1.z + s2.z,
			w : s1.w + s2.w
		};
	}
	SIMD.float32x4.sub = function(s1, s2) {
		return {
			x : s1.x - s2.x,
			y : s1.y - s2.y,
			z : s1.z - s2.z,
			w : s1.w - s2.w
		};
	}
	SIMD.float32x4.mul = function(s1, s2) {
		return {
			x : s1.x * s2.x,
			y : s1.y * s2.y,
			z : s1.z * s2.z,
			w : s1.w * s2.w
		};
	}
	SIMD.float32x4.div = function(s1, s2) {
		return {
			x : s1.x / s2.x,
			y : s1.y / s2.y,
			z : s1.z / s2.z,
			w : s1.w / s2.w
		};
	}
	SIMD.float32x4.min = function(s1, s2) {
		return {
			x : s1.x < s2.x ? s1.x : s2.x,
			y : s1.y < s2.y ? s1.y : s2.y,
			z : s1.z < s2.z ? s1.z : s2.z,
			z : s1.z < s2.z ? s1.z : s2.z
		};
	}
	SIMD.float32x4.max = function(s1, s2) {
		return {
			x : s1.x > s2.x ? s1.x : s2.x,
			y : s1.y > s2.y ? s1.y : s2.y,
			z : s1.z > s2.z ? s1.z : s2.z,
			z : s1.z > s2.z ? s1.z : s2.z
		};
	}
	SIMD.float32x4.neg = function(s) {
		return {
			x : (-1) * s.x,
			y : (-1) * s.y,
			z : (-1) * s.z,
			w : (-1) * s.w
		};
	}
}

//utils
var formatThousands = formatThousands ||  function formatThousands(f) {
	return f.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// vec operations
var fromArray = function(arr) {
	if(!arr || typeof(arr.length) != "number"){
		throw("invalid input array");
	}

	var arrSIMD = [];

	for (var i = 4; i <= arr.length; i += 4) {
		arrSIMD.push(SIMD.float32x4(arr[i - 4], arr[i - 3], arr[i - 2],
				arr[i - 1]));
	}

	var rem = arr.length % 4;
	if (rem == 1) {
		arrSIMD.push(SIMD.float32x4(arr[arr.length - 1], NaN, NaN, NaN));
	} else if (rem == 2) {
		arrSIMD.push(SIMD.float32x4(arr[arr.length - 2],
				arr[arr.length - 1], NaN, NaN));
	}
	if (rem == 3) {
		arrSIMD.push(SIMD.float32x4(arr[arr.length - 3],
				arr[arr.length - 2], arr[arr.length - 1], NaN));
	}

	return arrSIMD;
}
var from2dArray = function (arr){
	if(!arr || typeof(arr.length) != "number"){
		throw("input input 2d array");
	}

	var mat = [];
	for(var i=0; i< arr.length; i++){
		mat[i] = fromArray(arr[i]);
	}

	return mat;
}
var toArray = function(SIMDarr) {
	var arr = [];

	SIMDarr.reduce(function(prev, curr) {
		if (!isNaN(curr.w)) {// full SIMD
			arr.push(curr.x);
			arr.push(curr.y);
			arr.push(curr.z);
			arr.push(curr.w);
		} else if (!isNaN(curr.z)) {
			arr.push(curr.x);
			arr.push(curr.y);
			arr.push(curr.z);
		} else if (!isNaN(curr.y)) {
			arr.push(curr.x);
			arr.push(curr.y);
		} else if (!isNaN(curr.x)) {
			arr.push(curr.x);
		}
	}, this);

	return arr;
}
var vecSqr = function(arrSIMD) {
	return arrSIMD.map(function(item) {
		return SIMD.float32x4.mul(item, item);
	}, this);
}
var sum = function(arrSIMD) {
	var sumSIMD = arrSIMD.reduce(function(previousValue, currentValue,
			index, array) {
		if (index < array.length - 1) {
			return SIMD.float32x4.add(previousValue, currentValue)
		} else {
			return previousValue;
		}
	}, SIMD.float32x4.zero());
	var last = arrSIMD[arrSIMD.length - 1];
	return sumSIMD.x + sumSIMD.y + sumSIMD.z + sumSIMD.w + last.x
			+ (!isNaN(last.y) ? last.y : 0) + (!isNaN(last.z) ? last.z : 0)
			+ (!isNaN(last.w) ? last.w : 0);
}
var mean = function(arrSIMD) {
	var len = vecLength(arrSIMD);
	if (len > 0) {
		return sum(arrSIMD) / len;
	} else {
		throw ("empty simd vec");
	}
}
var std = function(arrSIMD, _mean) {
	if (!_mean) {
		_mean = mean(arrSIMD);
	}
	var length = vecLength(arrSIMD);
	var meanSIMD = SIMD.float32x4(_mean, _mean, _mean, _mean);
	var sqrDiffsArrSIMD = arrSIMD.map(function(item) {
		var subSIMD = SIMD.float32x4.sub(item, meanSIMD);
		return SIMD.float32x4.mul(subSIMD, subSIMD);
	});

	return Math.sqrt(sum(sqrDiffsArrSIMD) / (length - 1));
}
var vecLength = function(arrSIMD) {
	if (!arrSIMD || arrSIMD.length == 0) {
		return 0;
	}

	var lastNaNs = 0;
	if (isNaN(arrSIMD[arrSIMD.length - 1].y)) {
		lastNaNs = 3;
	} else if (isNaN(arrSIMD[arrSIMD.length - 1].z)) {
		lastNaNs = 2;
	} else if (isNaN(arrSIMD[arrSIMD.length - 1].w)) {
		lastNaNs = 1;
	}
	return arrSIMD.length * 4 - lastNaNs;
}
var vecVecAdd = function(arrSIMD1, arrSIMD2) {
	if (vecLength(arrSIMD1) != vecLength(arrSIMD2)) {
		throw ("cannot add arrays with different sizes: " + vecLength(arrSIMD1) + " and " + vecLength(arrSIMD2));
	}
	return arrSIMD1.map(function(item, index) {
		return SIMD.float32x4.add(item, arrSIMD2[index]);
	}, this);
}
var vecVecSub = function(arrSIMD1, arrSIMD2) {
	if (vecLength(arrSIMD1) != vecLength(arrSIMD2)) {
		throw ("cannot subtract arrays with different sizes: " + vecLength(arrSIMD1) + " and " + vecLength(arrSIMD2));
	}
	return arrSIMD1.map(function(item, index) {
		return SIMD.float32x4.sub(item, arrSIMD2[index]);
	}, this);
}
var vecScalAdd = function(arrSIMD, f) {
	var fSIMD = SIMD.float32x4(f, f, f, f);
	return arrSIMD.map(function(item) {
		return SIMD.float32x4.add(item, fSIMD);
	}, this);
}
var vecScalSub = function(arrSIMD, f) {
	var fSIMD = SIMD.float32x4(f, f, f, f);
	return arrSIMD.map(function(item) {
		return SIMD.float32x4.sub(item, fSIMD);
	}, this);
}
var vecScalMul = function(arrSIMD, f) {
	var fSIMD = SIMD.float32x4(f, f, f, f);
	return arrSIMD.map(function(item) {
		return SIMD.float32x4.mul(item, fSIMD);
	}, this);
}
var vecVecMul = function(v, h) {
	if (vecLength(v) != vecLength(h)) {
		throw ("cannot mul vectors with different lengths: " + vecLength(v)
				+ " and " + vecLength(h));
	}

	return sum(v.map(function(item, index) {
		return SIMD.float32x4.mul(item, h[index]);
	}, this));
}
var vecVecElmMul = function(v, h) {
	if (vecLength(v) != vecLength(h)) {
		throw ("cannot mul vectors with different lengths: " + vecLength(v)
				+ " and " + vecLength(h));
	}

	return v.map(function(item, index) {
		return SIMD.float32x4.mul(item, h[index]);
	}, this);
}
var vecNeg = function(arrSIMD) {
	return arrSIMD.map(function(item) {
		return SIMD.float32x4.neg(item);
	});
}
var vecLog = function(arrSIMD) {
	return arrSIMD.map(function(item) {
		return SIMD.float32x4(Math.log(item.x), Math.log(item.y), Math
				.log(item.z), Math.log(item.w));
	});
}
var vecRound = function(arrSIMD) {
	return arrSIMD.map(function(item) {
		return SIMD.float32x4(Math.round(item.x), Math.round(item.y), Math
				.round(item.z), Math.round(item.w));
	});
}
var vecComp = function(arrSIMD1, arrSIMD2) {
	return arrSIMD1.map(function(item, index) {
		return SIMD.float32x4(item.x == arrSIMD2[index].x ? 1 : 0,
				item.y == arrSIMD2[index].y ? 1 : 0,
				item.z == arrSIMD2[index].z ? 1 : 0,
				item.w == arrSIMD2[index].w ? 1 : 0);
	}, this);
}
var vecSigmoid = function(arrSIMD) {
	//g(i, j) = 1 / (1 + * e ^ (-1 * z(i, j)));
	return arrSIMD.map(function(item) {
		return SIMD.float32x4.div(SIMD.float32x4(1, 1, 1, 1),
				SIMD.float32x4.add(SIMD.float32x4(1, 1, 1, 1), scalSimdPow(
						Math.E, SIMD.float32x4.neg(item))));
	});
}
var vecPow = function(vec, p) {
	return vec.map(function(item) {
		return SIMD.float32x4(!isNaN(item.x) ? Math.pow(item.x, p) : NaN,
				!isNaN(item.y) ? Math.pow(item.y, p) : NaN,
				!isNaN(item.z) ? Math.pow(item.z, p) : NaN,
				!isNaN(item.w) ? Math.pow(item.w, p) : NaN)
	}, this);
}
var scalSimdPow = function(scalar, simd) {// scalar.^simd
	return SIMD.float32x4(Math.pow(scalar, simd.x), Math
			.pow(scalar, simd.y), Math.pow(scalar, simd.z), Math.pow(
			scalar, simd.w));
}
var printVec = function(v) {
	var sb = [];
	for (var i = 0; i < v.length; i++) {
		sb.push("[");
		sb.push(v[i].x);
		sb.push(" ");
		sb.push(v[i].y);
		sb.push(" ");
		sb.push(v[i].z);
		sb.push(" ");
		sb.push(v[i].w);
		sb.push("]");
	}
	console.log(sb.join(""));
}
var min = function(arrSIMD) {
	var minSIMD = arrSIMD.reduce(function(previousValue, currentValue,
			index, array) {
		if (index < array.length - 1) {
			return SIMD.float32x4.min(previousValue, currentValue)
		} else {
			return previousValue;
		}
	});
	var last = arrSIMD[arrSIMD.length - 1];
	var arr = [ minSIMD.x, minSIMD.y, minSIMD.z, minSIMD.w, last.x ];
	if (!isNaN(last.y)) {
		arr.push(last.y);
	}
	if (!isNaN(last.z)) {
		arr.push(last.z);
	}
	if (!isNaN(last.w)) {
		arr.push(last.w);
	}

	return arr.sort(function(a, b) {
		return a - b;
	})[0]
}
var max = function(arrSIMD) {
	var maxSIMD = arrSIMD.reduce(function(previousValue, currentValue,
			index, array) {
		if (index < array.length - 1) {
			return SIMD.float32x4.max(previousValue, currentValue)
		} else {
			return previousValue;
		}
	});
	var last = arrSIMD[arrSIMD.length - 1];
	var arr = [ maxSIMD.x, maxSIMD.y, maxSIMD.z, maxSIMD.w, last.x ];
	if (!isNaN(last.y)) {
		arr.push(last.y);
	}
	if (!isNaN(last.z)) {
		arr.push(last.z);
	}
	if (!isNaN(last.w)) {
		arr.push(last.w);
	}

	return arr.sort(function(a, b) {
		return b - a;
	})[0]
}
var ones = function(length) {
	var arr = [];
	var simdLength = Math.floor(length / 4)
	var rem = length % 4;

	for (var i = 0; i < simdLength; i++) {
		arr[i] = SIMD.float32x4(1, 1, 1, 1);
	}
	if (rem == 1) {
		arr.push(SIMD.float32x4(1, NaN, NaN, NaN));
	} else if (rem == 2) {
		arr.push(SIMD.float32x4(1, 1, NaN, NaN));
	} else if (rem == 3) {
		arr.push(SIMD.float32x4(1, 1, 1, NaN));
	}

	return arr;
}
var zeros = function(length) {
	var arr = [];
	var simdLength = Math.floor(length / 4)
	var rem = length % 4;

	for (var i = 0; i < simdLength; i++) {
		arr[i] = SIMD.float32x4.zero();
	}
	if (rem == 1) {
		arr.push(SIMD.float32x4(0, NaN, NaN, NaN));
	} else if (rem == 2) {
		arr.push(SIMD.float32x4(0, 0, NaN, NaN));
	} else if (rem == 3) {
		arr.push(SIMD.float32x4(0, 0, 0, NaN));
	}

	return arr;
}
var cartProd = function(X1, X2) {
	var arr1 = toArray(X1);
	var arr2 = toArray(X2);
	var res1 = [];
	var res2 = [];

	for (var i = 0; i < arr1.length; i++) {
		for (var j = 0; j < arr2.length; j++) {
			res1.push(arr1[i]);
			res2.push(arr2[j]);
		}
	}

	return [ fromArray(res1), fromArray(res2) ];
}
var slice = function(src, startIndex, endIndex) {
	return fromArray(toArray(src).slice(startIndex, endIndex));
}
var featMap = function(X1, X2, deg) {
	/*degree = 6; out = ones(size(X1(:,1))); 
	for i = 1:degree
		for j = 0:i out(:, end+1) = (X1.^(i-j)).*(X2.^j); 
		end 
	end*/
	var mat = [];
	for (var i = 1; i <= deg; i++) {
		for (var j = 0; j <= i; j++) {
			// console.log("feature mapping X1^" + (i-j) + " X2^" + j + "(i=" + i + ", j=" + j + ")");
			mat[mat.length] = vecVecElmMul(vecPow(X1, i - j), vecPow(X2, j));
		}
	}
	return mat;
}
var vecItem = function(simdVec, ind) {
	if (isNaN(ind) || ind != parseInt(ind) || ind < 0) {
		throw ("invalid vector index " + ind);
	}
	if (ind >= vecLength(simdVec)) {
		throw ("vector index " + ind + " out of range ("
				+ vecLength(simdVec) + ")");
	}

	var div = Math.floor(ind / 4);
	var rem = ind % 4;

	if (rem == 0) {
		return simdVec[div].x;
	} else if (rem == 1) {
		return simdVec[div].y;
	} else if (rem == 2) {
		return simdVec[div].z;
	} else {
		return simdVec[div].w;
	}
}
var find = function(simdVec, indArr) {
	var arr = [];
	arr = indArr.map(function(ind) {
		return vecItem(simdVec, ind);
	}, this);

	return fromArray(arr);
}

// mat operations
var matSize = function(simdMat) {
	if (!simdMat || simdMat.length == 0) {
		return [ 0, 0 ];
	} else {
		return [ vecLength(simdMat[0]), simdMat.length ];
	}
}
var matVecMul = function(A, v) {
	if (!A || !A.length || A.length == 0) {
		throw ("empty matrix");
	}
	if (!v || !v.length || v.length == 0) {
		throw ("empty vector");
	}
	var size = matSize(A);
	var length = vecLength(v);
	if (size[0] != length) {
		throw ("cannot multiply matrix size " + size[0] + " X " + size[1] + " with vector length " + length);
	}

	//console.log("multipling matrix size " + size[0] + " X " + size[1] + " with vector length " + length);
	var res = [];
	for (var i = 0; i < A.length; i += 4) {
		res[i / 4] = SIMD.float32x4(A[i] ? vecVecMul(A[i], v) : NaN,
				A[i + 1] ? vecVecMul(A[i + 1], v) : NaN,
				A[i + 2] ? vecVecMul(A[i + 2], v) : NaN,
				A[i + 3] ? vecVecMul(A[i + 3], v) : NaN);
	}

	return res;
}
var matTrans = function(X) {
	var Xt = [];
	var rows = X.length;
	var columns = X[0].length;
	var l = vecLength(X[0]);

	for (var i = 0; i < l; i++) {
		Xt[i] = [];
	}

	for (var r = 0; r < rows; r += 4) {
		for (var c = 0; c < columns; c++) {
			Xt[c * 4].push(SIMD.float32x4((X[r] && X[r][c]) ? X[r][c].x
					: NaN, (X[r + 1] && X[r + 1][c]) ? X[r + 1][c].x : NaN,
					(X[r + 2] && X[r + 2][c]) ? X[r + 2][c].x : NaN,
					(X[r + 3] && X[r + 3][c]) ? X[r + 3][c].x : NaN));

			if (l - 1 >= c * 4 + 1) {
				Xt[c * 4 + 1].push(SIMD.float32x4(
						(X[r] && X[r][c]) ? X[r][c].y : NaN,
						(X[r + 1] && X[r + 1][c]) ? X[r + 1][c].y : NaN,
						(X[r + 2] && X[r + 2][c]) ? X[r + 2][c].y : NaN,
						(X[r + 3] && X[r + 3][c]) ? X[r + 3][c].y : NaN));
			}

			if (l - 1 >= c * 4 + 2) {
				Xt[c * 4 + 2].push(SIMD.float32x4(
						(X[r] && X[r][c]) ? X[r][c].z : NaN,
						(X[r + 1] && X[r + 1][c]) ? X[r + 1][c].z : NaN,
						(X[r + 2] && X[r + 2][c]) ? X[r + 2][c].z : NaN,
						(X[r + 3] && X[r + 3][c]) ? X[r + 3][c].z : NaN));
			}

			if (l - 1 >= c * 4 + 3) {
				Xt[c * 4 + 3].push(SIMD.float32x4(
						(X[r] && X[r][c]) ? X[r][c].w : NaN,
						(X[r + 1] && X[r + 1][c]) ? X[r + 1][c].w : NaN,
						(X[r + 2] && X[r + 2][c]) ? X[r + 2][c].w : NaN,
						(X[r + 3] && X[r + 3][c]) ? X[r + 3][c].w : NaN));
			}
		}
	}
	return Xt;
}
var printMat = function(A) {
	var sb = [];

	for (var i = 0; i < A.length; i++) {
		for (var j = 0; j < A[0].length; j++) {
			sb.push("[");
			sb.push(A[i][j].x);
			sb.push(" ");
			sb.push(A[i][j].y);
			sb.push(" ");
			sb.push(A[i][j].z);
			sb.push(" ");
			sb.push(A[i][j].w);
			sb.push("]");
		}
		sb.push("EOL\n");
	}
	console.log(sb.join(""));
}
var matItem = function(simdMat, rowInd, colInd) {
	if (isNaN(rowInd) || rowInd != parseInt(rowInd) || rowInd < 0) {
		throw ("invalid matrix row index " + rowInd);
	}
	if (isNaN(colInd) || colInd != parseInt(colInd) || colInd < 0) {
		throw ("invalid matrix column index " + colInd);
	}
	var size = matSize(simdMat);
	if (rowInd >= size[0]) {
		throw ("matrix row index " + rowInd + " out of range (" + size[0] + ")");
	}
	if (colInd >= size[1]) {
		throw ("matrix column index " + colInd + " out of range ("
				+ size[1] + ")");
	}

	return vecItem(simdMat[colInd], rowInd);
}
var matRow = function(simdMat, rowInd) {
	if (isNaN(rowInd) || rowInd != parseInt(rowInd) || rowInd < 0) {
		throw ("invalid matrix row index " + rowInd);
	}
	var size = matSize(simdMat);
	if (rowInd >= size[0]) {
		throw ("matrix row index " + rowInd + " out of range (" + size[0] + ")");
	}

	var row = [];
	for (var i = 0; i < size[1]; i++) {
		row.push(vecItem(simdMat[i], rowInd));
	}

	return fromArray(row);
}
var matCol = function(simdMat, colInd) {
	if (isNaN(colInd) || colInd != parseInt(colInd) || colInd < 0) {
		throw ("invalid matrix column index " + colInd);
	}
	var size = matSize(simdMat);
	if (colInd >= size[1]) {
		throw ("matrix column index " + colInd + " out of range ("
				+ size[1] + ")");
	}

	return simdMat[colInd];
}

// simd vec selector
var SimdVec = function(simdVec) {
	if (simdVec && simdVec.isSimdfiedVec) {
		return simdVec; // already a selector
	} else {
		this.vec = simdVec ? simdVec.length ? simdVec : [] : [];
		this.isSimdfiedVec = true;
	}

	// utils
	this.print = function() {
		printVec(this.vec);
	}
	this.map = function() {
		return this.vec.map.apply(this, arguments);// alias to native Array map
		//TODO: fix it!
	}

	// vec return type
	this.fromArray = function(arr) {
		return simdfied.vec(fromArray(arr));
	}
	this.find = function(indArr) {
		return simdfied.vec(find(this.vec, indArr));
	}
	this.slice = function(startInd, endInd) {
		return simdfied.vec(slice(this.vec, startInd, endInd));
	}
	this.ones = function(len) {
		return simdfied.vec(ones(len));
	}
	this.zeros = function(len) {
		return simdfied.vec(zeros(len));
	}
	this.sqr = function() {
		return simdfied.vec(vecSqr(this.vec));
	}
	this.neg = function() {
		return simdfied.vec(vecNeg(this.vec));
	}
	this.log = function() {
		return simdfied.vec(vecLog(this.vec));
	}
	this.round = function() {
		return simdfied.vec(vecRound(this.vec));
	}
	this.sigmoid = function() {
		return simdfied.vec(vecSigmoid(this.vec));
	}
	this.add = function(simdVec) {
		return simdfied.vec(vecVecAdd(this.vec, simdVec.vec ? simdVec.vec
				: simdVec));
	}
	this.sub = function(simdVec) {
		return simdfied.vec(vecVecSub(this.vec, simdVec.vec ? simdVec.vec
				: simdVec));
	}
	this.addScal = function(scal) {
		return simdfied.vec(vecScalAdd(this.vec, scal));
	}
	this.subScal = function(scal) {
		return simdfied.vec(vecScalSub(this.vec, scal));
	}
	this.mulScal = function(scal) {
		return simdfied.vec(vecScalMul(this.vec, scal));
	}
	this.mulElm = function(simdVec) {
		return simdfied.vec(vecVecElmMul(this.vec,
				simdVec.vec ? simdVec.vec : simdVec));
	}
	this.comp = function(simdVec) {
		return simdfied.vec(vecComp(this.vec, simdVec.vec ? simdVec.vec
				: simdVec));
	}
	this.pow = function(pow) {
		return simdfied.vec(vecPow(this.vec, pow));
	}

	// other types
	this.length = function() {
		return vecLength(this.vec);
	}
	this.item = function(ind) {
		return vecItem(this.vec, ind);
	}
	this.toArray = function() {
		return toArray(this.vec);
	}
	this.mul = function(simdVec) {
		return vecVecMul(this.vec, simdVec.vec ? simdVec.vec : simdVec);
	}
	this.cartProd = function(simdVec) {
		var arr = cartProd(this.vec, simdVec.vec ? simdVec.vec : simdVec);
		return [ simdfied.vec(arr[0]), simdfied.vec(arr[1]) ];
	}
	this.featMap = function(simdVec, deg) {
		return simdfied.mat(featMap(this.vec, simdVec.vec ? simdVec.vec	: simdVec, deg));
	}
	this.sum = function() {
		return sum(this.vec);
	}
	this.min = function() {
		return min(this.vec);
	}
	this.max = function() {
		return max(this.vec);
	}
	this.range = function() {
		return [ min(this.vec), max(this.vec) ];
	}
	this.std = function(mean) {
		return std(this.vec, mean);
	}
	this.mean = function() {
		return mean(this.vec);
	}

	return this;
}
simdfied.vec = function(simdVec) {
	return new SimdVec(simdVec);
}

// simd mat selector
var SimdMat = function(simdMat) {
	if (simdMat && simdMat.isSimdfiedMat) {
		return simdMat; // already a selector
	} else {
		this.mat = simdMat ? simdMat.length ? simdMat : [] : [];
		this.isSimdfiedMat = true;
	}

	// utils
	this.print = function() {
		printMat(this.mat);
	}

	// mat type
	this.from2dArray = function(arr) {
		return simdfied.mat(from2dArray(arr));
	}
	this.concat = function(simdMat) {
		return simdfied.mat(this.mat.concat(simdMat.mat ? simdMat.mat : simdMat));
	}
	this.addCol = function(simdVec) {
		return simdfied.mat(this.mat.concat([ simdVec.vec ? simdVec.vec	: simdVec ]));
	}
	this.trans = function() {
		return simdfied.mat(matTrans(this.mat));
	}

	// vec type
	this.mulVec = function(simdVec) {
		return simdfied.vec(matVecMul(this.mat, simdVec.vec ? simdVec.vec : simdVec));
	}

	// other types
	this.size = function() {
		return matSize(this.mat);
	}
	this.row = function(ind) {
		return simdfied.vec(matRow(this.mat, ind));
	}
	this.col = function(ind) {
		return simdfied.vec(matCol(this.mat, ind));
	}
	this.item = function(colInd, rowInd) {
		return matItem(this.mat, colInd, rowInd);
	}

	return this;
}
simdfied.mat = function(simdMat) {
	return new SimdMat(simdMat);
}

// simd ml selector
var mlAlgo = ["linReg", "logReg", "kmeans"];
var mlAlgoName = ["linear regression", "logistic regression", "K-means"];
var gradientDescent = function(ml) {
	timeStamp = new Date();

	ml.theta = simdfied.vec().zeros(ml.XNorm.length).vec;
	ml.cost = [];

	ml.cost[0] = costFun(ml);
	console.log("initial cost: " + formatThousands(ml.cost[0].toFixed(2)));

	for (var i = 1; i < ml.settings["iter"] + 1; i++) {
		var h = hipo(ml);
		var hMiny = simdfied.vec(h).sub(ml.yNorm);
		var lambda = simdfied.mat(ml.XNorm).mulVec(hMiny);
		ml.theta = simdfied.vec(ml.theta).sub(lambda.mulScal(ml.settings["alpha"] / ml.m)).vec;

		var cost = costFun(ml);
		if ([Infinity, -Infinity, NaN].indexOf(cost) != -1 || (cost > ml.cost[i - 1])) {//bad value or going up
			break;
		} else {
			ml.cost[i] = cost;
		}
		
		if(postMessage){
			postMessage({prog: i / ml.settings["iter"], onProg: ml.onProg});
		}
	}

	console.log("gradientDescent done (" + formatThousands(new Date() - timeStamp) + "ms)");
	console.log("cost after #" + ml.cost.length + " iterations " + formatThousands(ml.cost[i - 1].toFixed(2)));
}
var hipo = function(ml) {
	if (ml.algo == "linReg") {
		return simdfied.mat(ml.XNormT).mulVec(ml.theta).vec;
	} else if (ml.algo == "logReg") {
		return simdfied.mat(ml.XNormT).mulVec(ml.theta).sigmoid().vec;
	}
}
var costFun = function(ml) {
	if (ml.algo == "linReg") {
		//h = X * theta;
		//J = 1/(2*m) * sum((h - y).^2);              
		var h = simdfied.vec(hipo(ml));
		return 1 / (2 * ml.m) * h.sub(ml.yNorm).sqr().sum();
	} else if (ml.algo == "logReg") {
		//h = sigmoid(X * theta);
		//J = 1/m * sum(-y .* log(h) - (1 - y) .* log(1 - h));
		//with reg J = 1/m * sum(-y .* log(h) - (1 - y) .* log(1 - h)) + lambda/(2*m) * sum(theta(2:size(theta)).^2);

		//sum(-y .* log(h) - (1 - y) .* log(1 - h))
		var h = simdfied.vec(hipo(ml));
		var yNeg = simdfied.vec(ml.yNorm).neg();
		//-y .* log(h)
		var step1 = yNeg.mulElm(h.log());
		//(1 - y) .* log(1 - h)
		var step2 = yNeg.addScal(1).mulElm(h.neg().addScal(1).log());
		//In case we got new NaNs - return high cost to exit loop
		//It currently happens when log returns -Infinity because sigmoid returned 1, and later multiplied by zero (=>undefined)
		//TODO: adjust values to the right "dynamic range"
		if(step2.length() < step1.length()){
			return Infinity;
		}
		var sum1 = step1.sub(step2).sum();

		var J = (1 / ml.m) * sum1;
		if (ml.settings["regLambda"]) {
			//sum(theta(2:size(theta)).^2)
			var sum2 = simdfied.vec(ml.theta).sqr().sum()
					- Math.pow(ml.theta[0].x, 2);//The sum excluding the 1st
			J += ((ml.settings["regLambda"] / (2 * ml.m)) * sum2);
		}
		return J;
	}
}
var norm = function(ml) {
	var timeStamp = new Date();

	ml.trainSize = Math.round(ml.split[0] * ml.m);
	ml.testSize = ml.m - ml.trainSize;

	var simdTrainLength = Math.floor(ml.trainSize / 4)
	var rem = ml.trainSize % 4;

	ml.XNorm = [];
	ml.XTest = [];
	ml.mu = [];
	ml.sigma = [];

	if (ml.settings["addInter"]) {
		ml.XNorm[0] = simdfied.vec().ones(ml.trainSize).vec;
		if (ml.testSize > 0) {
			ml.XTest[0] = simdfied.vec().ones(ml.testSize).vec;
		}
	}
	if (ml.settings["featMap"] && ml.X.length > 1) {
		ml.XNorm = ml.XNorm.concat(simdfied.vec(ml.X[0]).slice(0, ml.trainSize).featMap(simdfied.vec(ml.X[1]).slice(0, ml.trainSize).vec, ml.settings["featMap"]).mat);
		ml.XTest = ml.XTest.concat(simdfied.vec(ml.X[0]).slice(ml.trainSize, ml.trainSize + ml.testSize).featMap(simdfied.vec(ml.X[1]).slice(ml.trainSize, ml.trainSize + ml.testSize).vec, ml.settings["featMap"]).mat);
	}

	for (var i = 0; i < ml.X.length; i++) {
		ml.mu[i] = simdfied.vec(ml.X[i]).mean();
		ml.sigma[i] = simdfied.vec(ml.X[i]).std(ml.mu[i]);
		var simdMu = SIMD.float32x4(ml.mu[i], ml.mu[i], ml.mu[i], ml.mu[i]);
		var simdStd = SIMD.float32x4(ml.sigma[i], ml.sigma[i], ml.sigma[i],	ml.sigma[i]);

		//(X(:, j) - mu(j)) / sigma(j);
		ml.XNorm[i + ml.settings["addInter"]] = simdfied.vec(ml.X[i]).slice(0, ml.trainSize).vec.map(function(item) {
			if (ml.settings["normMeanStd"]) {
				return SIMD.float32x4.div(SIMD.float32x4.sub(item, simdMu),	simdStd);
			} else {
				return item;
			}
		}, this);

		if (ml.testSize > 0) {
			ml.XTest[i + ml.settings["addInter"]] = simdfied.vec(ml.X[i]).slice(ml.trainSize, ml.trainSize + ml.testSize).vec.map(	function(item) {
				if (ml.settings["normMeanStd"]) {
					return SIMD.float32x4.div(SIMD.float32x4.sub(
							item, simdMu), simdStd);
				} else {
					return item;
				}
			}, this);
		}
	}
	ml.yNorm = simdfied.vec(ml.y).slice(0, ml.trainSize).vec;
	ml.yTest = simdfied.vec(ml.y).slice(ml.trainSize,
			ml.trainSize + ml.testSize);
	console.log("normalization done (" + formatThousands(new Date() - timeStamp) + "ms)");

	timeStamp = new Date();
	ml.XNormT = simdfied.mat(ml.XNorm).trans().mat;
	if (ml.testSize > 0) {
		ml.XTestT = simdfied.mat(ml.XTest).trans().mat;
	}
	//console.log("X transpose done (" + formatThousands(new Date() - timeStamp) + "ms)");
}
var accur = function(ml) {
	switch (ml.algo) {
		case "logReg":
			var trainPred = hipo(ml);
			trainPred = simdfied.vec(trainPred).round();
			ml.trainAccur = simdfied.vec(ml.yNorm).comp(trainPred).sum() / simdfied.vec(ml.yNorm).length();
			console.log("train accuracy: " + ml.trainAccur*100 + "%");
			break;
	}

	if (ml.testSize > 0) {
		switch (ml.algo) {
			case "logReg":
				var testPred = simdfied.mat(ml.XTestT).mulVec(ml.theta).sigmoid().round();
				ml.testAccur = simdfied.vec(ml.yTest).comp(testPred).sum() / simdfied.vec(ml.yTest).length();
				console.log("test accuracy: " + (ml.testAccur*100).toFixed(1) + "%");
				break;
		}
	}
}
var predOne = function(ml, xArr) {
	//price = [1 ([2250 4] - mu) ./  sigma] * theta;
	if(["linReg", "logReg"].indexOf(ml.algo) == -1){
		throw("prediction is not available for this algorithm");
	}
	
	var xNormArr = xArr.slice();//clone
	if (ml.settings["normMeanStd"]) {
		for (var i = 0; i < xNormArr.length; i++) {
			xNormArr[i] = (xNormArr[i] - ml.mu[i]) / ml.sigma[i];
		}
	}
	if (ml.settings["addInter"]) {
		xNormArr.unshift(1);
	}

	var p = simdfied.vec().fromArray(xNormArr).mul(ml.theta);
	if (ml.algo == "logReg") {
		p = p.sigmoid();
	}

	switch(ml.algo){
		case "linReg":
			console.log("predicting for features [" + xArr + "] the value of " + formatThousands(p.toFixed(2)));
			break;		
		case "logReg":
			console.log("predicting for features [" + xArr + "] a label of " + p.toFixed(2));
			break;
	}

	return p;
}
var resetKmeans = function(ml){
	ml.kmeansCentroids = [];
	ml.kmeansIdx = [];
	
	ml.x1Range = simdfied.mat(ml.X).col(0).range();
	ml.x2Range = simdfied.mat(ml.X).col(1).range();

	for (var k = 0; k < ml.settings["kmeansK"]; k++) {
		var centroid = [];
		centroid.push(ml.x1Range[0] + Math.random() * (ml.x1Range[1] - ml.x1Range[0]));
		centroid.push(ml.x2Range[0] + Math.random()	* (ml.x2Range[1] - ml.x2Range[0]));
		ml.kmeansCentroids.push(centroid);
	}
}
var kmeans = function(ml) {
	if(!ml.kmeansCentroids){
		resetKmeans(ml);
	}
	
	for(i=0; i<ml.settings["kmeansIter"]; i++){
		//console.log("kmeans iter #" + i+1);
		//assign points to centroids
		for (var m = 0; m < ml.m; m++) {
			var x = null;
			x = simdfied.mat(ml.X).row(m).toArray();
			var currMin = 0;
			for (var k = 0; k < ml.settings["kmeansK"]; k++) {
				var centroid = ml.kmeansCentroids[k];
				var diff = 0;
				for (var n = 0; n < ml.n; n++) {
					diff += (Math.pow(x[n] - centroid[n], 2));
				}
				if (k == 0 || diff < currMin) {
					currMin = diff;
					ml.kmeansIdx[m] = k;
				}
			}
		}
		//center centroids
		for (var k = 0; k < ml.settings["kmeansK"]; k++) {
			var kidx = ml.kmeansIdx.map(function(item, index) {
				if (item == k) {
					return index;
				} else {
					return null;
				}
			}, this).filter(function(item) {
				return item != null;
			}, this);

			if (kidx.length > 0) {
				for (var n = 0; n < ml.n; n++) {
					ml.kmeansCentroids[k][n] = simdfied.vec(ml.X[n]).find(kidx).mean();
				}
			}
		}
	}
}
var currentScript = function(){
	return "simdfied.js";
}
var currentLocation = function(){
	return document.location.href.substring(0, document.location.href.lastIndexOf("/"));
}

var SimdMl = function(simdMl) {
	if (simdMl && simdMl.isSimdfiedMl) {
		return simdMl; // already a selector
	} else {
		this.ml = simdMl ? simdMl : {
			split: [1,0,0],
			settings: {addInter: true, normMeanStd: true, regLambda: false, iter: 100, alpha: 0.01, kmeansK: 3, kmeansIter: 10},
			worker: null
		};	
		this.isSimdfiedMl = true;
	}

	//ml type
	this.algo = function(algo){
		if(typeof(algo) != "string" || mlAlgo.indexOf(algo) == -1){
			throw("non supported algorithm " + algo + ". supported algorithms: " + mlAlgo.join(" ")); 
		}
		this.ml.algo = algo;
		return simdfied.ml(this.ml);
	} 
	this.X = function(simdMat){
		if(!simdMat || !simdMat.isSimdfiedMat){
			throw("X must be a non empty simdfied matrix");
		}
		var size = simdMat.size();
		if (size[0] + size[1] < 2){
			throw("X must be a non empty simdfied matrix");
		}
		this.ml.X = simdMat.mat;
		this.ml.m = size[0];
		this.ml.n = size[1];
		return simdfied.ml(this.ml);
	}
	this.y = function(simdVec){
		if(!simdVec || !simdVec.isSimdfiedVec || simdVec.length() == 0){
			throw("y must be a non empty simdfied vector");
		}
		this.ml.y = simdVec.vec;
		return simdfied.ml(this.ml);
	}
	this.onProg = function(fn){
		if(typeof(fn) != "function"){
			throw("progress call back must be a funcion");
		}
		//this.ml.onProg = fn;
		this.ml.onProg = fn.name;
		//this.ml.onProg = fn.name || ("(" + fn.toString() + ")");//function name, or anonymous function body
		//this.ml.onProg = ("(" + fn.toString() + ")");
		//this.ml.onProg = fn.toString();
		return simdfied.ml(this.ml);
	}
	this.split = function(split){
		if(!split || !split.length || split.length != 3){
			throw("split must be a 3 element array for train, test and cross-validation precentage split");
		}
		var total = 0;
		split = split.map(function(item){
			if(isNaN(item) || parseInt(item)!=item || item<0 || item>100){
				throw("split percentage item must be an int ranging from 0 to 100");
			}
			total += item;
			return item/100;
		});
		if(total != 100){
			throw("split percentage items total must equal to 100");
		}
					
		this.ml.split = split;
		return simdfied.ml(this.ml);
	}
	this.set = function(key, value){
		if(!key || typeof(key)!="string" || key.length == 0){
			throw("setting key must be a non empty string");
		}
		if(["number", "boolean"].indexOf(typeof(value)) == -1 ){
			throw("setting value must be a boolean or a number");
		}
		this.ml.settings[key] = value;
		return simdfied.ml(this.ml);
	}
	this.parse = function(obj){
		return simdfied.ml(JSON.parse(obj, function(key, value) {
			if (value === "Infinity") {
				return Infinity;
			} else if (value === "-Infinity") {
				return -Infinity;
			} else if (value === "NaN") {
				return NaN;
			}
			return value;
		}));
	}
	this.reset = function(){
		switch(this.ml.algo){
			case "kmeans":
				resetKmeans(this.ml);
				break;
		}
	}
	this.run = function(cbDone){
		if(this.ml.worker && this.ml.worker.terminate){
			try{			
				this.ml.worker.terminate();
			}
			catch(e){
				console.log(e);
			}
			this.ml.worker = null;
		}
		var mlWorkerCode = 
		"importScripts('" + currentLocation() + "/" + currentScript() + "');\n"
		+"onmessage=function(e){\n"
			+"postMessage(simdfied.ml().parse(e.data).runWorker().stringify());\n"
			+"self.close();\n"
		+"}\n";
		this.ml.worker = new Worker(window.URL.createObjectURL(new Blob([mlWorkerCode])));
		this.ml.worker.onmessage = function(e){
			if(e.data && e.data.prog){
				if(e.data.onProg){
					try{
						//new Function(e.data.onProg).call(self, e.data.prog);
						eval(e.data.onProg + "('" + e.data.prog + "');");
					}
					catch(e){
						console.log(e);
					}				
				}
			}
			else{
				if(typeof(cbDone) == "function"){
					try{
						cbDone.call(self, simdfied.ml().parse(e.data));
					}
					catch(e){
						console.log(e);
					}								
				}
			}
		}
		this.ml.worker.postMessage(this.stringify());
	}
	this.runWorker = function(){
		if(!this.ml.algo){
			throw("algorithm type must be specified using the \"algo\" function");
		}
		if(!this.ml.X){
			throw("X must be specified using the \"X\" function");
		}
		var algoInd = mlAlgo.indexOf(this.ml.algo);
		if(!this.ml.y && ["linReg", "logReg"].indexOf(this.ml.algo) != -1){
			throw("y must be specified for " + mlAlgoName[algoInd] + " using the \"y\" function");
		}
		
		console.log("running " + mlAlgoName[algoInd]);
		switch(this.ml.algo){
			case "linReg":
			case "logReg":
				norm(this.ml);
				gradientDescent(this.ml);
				accur(this.ml);
				break;
			case "kmeans":
				kmeans(this.ml);
				break;
		}

		return simdfied.ml(this.ml);
	}

	//other types
	this.stringify = function(){
		return JSON.stringify(this.ml, function(key, value) {
			if (typeof (value) == "number" && isNaN(value)) {
				return 'NaN';
			}
			if (value === Infinity) {
				return 'Infinity';
			}
			if (value === -Infinity) {
				return '-Infinity';
			}
			return value;
		});
	}
	this.hipo = function(){
		return hipo(this.ml);
	}
	this.predOne = function(xArr){
		return predOne(this.ml, xArr);
	}

	return this;
}
simdfied.ml = function(simdMl) {
	return new SimdMl(simdMl);
}

this.simdfied = simdfied;
})();
