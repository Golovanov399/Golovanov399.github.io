function PriorityQueue() {
	this.a = [];
	this.add = function(x) {
		this.a.push(x);
		let cur = this.a.length - 1;
		while (cur > 0) {
			let nx = Math.floor((cur - 1) / 2);
			if (this.a[cur] < this.a[nx]) {
				[this.a[cur], this.a[nx]] = [this.a[nx], this.a[cur]];
				cur = nx;
			} else {
				break;
			}
		}
	};
	this.pop = function() {
		if (this.a.length == 0) {
			return;
		}
		if (this.a.length == 1) {
			this.a.pop();
			return;
		}
		this.a[0] = this.a.slice(-1)[0];
		this.a.pop();
		let cur = 0;
		let len = this.a.length;
		while (true) {
			nx = cur;
			if (2 * cur + 1 < len) {
				if (this.a[nx] > this.a[2 * cur + 1]) {
					nx = 2 * cur + 1;
				}
			}
			if (2 * cur + 2 < len) {
				if (this.a[nx] > this.a[2 * cur + 2]) {
					nx = 2 * cur + 2;
				}
			}
			if (nx != cur) {
				[this.a[cur], this.a[nx]] = [this.a[nx], this.a[cur]];
				cur = nx;
			} else {
				break;
			}
		}
	};
	this.values = this.a;
}

function Cartesian() {
	function Node(key) {
		this.prior = Math.random();
		this.key = key;
		this.l = -1;
		this.r = -1;
	}

	this.nodes = [];
	this.root = -1;

	var split = (idx, key) => {	// <=, >
		if (idx == -1) {
			return [-1, -1];
		}
		if (this.nodes[idx].key <= key) {
			let tmp = split(this.nodes[idx].r, key);
			this.nodes[idx].r = tmp[0];
			return [idx, tmp[1]];
		} else {
			let tmp = split(this.nodes[idx].l, key);
			this.nodes[idx].l = tmp[1];
			return [tmp[0], idx];
		}
	}

	var merge = (left, right) => {
		if (left == -1) {
			return right;
		} else if (right == -1) {
			return left;
		} else if (this.nodes[left].prior < this.nodes[right].prior) {
			this.nodes[left].r = merge(this.nodes[left].r, right);
			return left;
		} else {
			this.nodes[right].l = merge(left, this.nodes[right].l);
			return right;
		}
	}

	this.has = function(key) {
		let cur = this.root;
		while (cur != -1) {
			if (this.nodes[cur].key < key) {
				cur = this.nodes[cur].r;
			} else if (this.nodes[cur].key > key) {
				cur = this.nodes[cur].l;
			} else {
				return true;
			}
		}
		return false;
	};

	this.add = function(key) {
		if (this.has(key)) {
			return;
		}
		this.nodes.push(new Node(key));
		let tmp = split(this.root, key);
		this.root = merge(merge(tmp[0], this.nodes.length - 1), tmp[1]);
	};

	this.remove = function(key) {
		// is not needed yet
	};

	this.forEach = function(callback) {
		let stack = [];
		if (this.root != -1) {
			stack.push(this.root);
		}
		while (stack.length > 0) {
			let idx = stack.pop();
			callback(this.nodes[idx].key);
			if (this.nodes[idx].l > -1) {
				stack.push(this.nodes[idx].l);
			}
			if (this.nodes[idx].r > -1) {
				stack.push(this.nodes[idx].r);
			}
		}
	};

	this.size = function() {
		return this.nodes.length;
	};
}