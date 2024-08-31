class A {
	static ctor<T extends typeof A>(this: T): InstanceType<T> {
		return new this() as InstanceType<T>;
	}
}

class B extends A {}

// Usage:
const instance = B.ctor(); // Type of 'instance' is 'B'
