// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, SumType, SumTypeVariant, IDatabaseTable, AlgebraicValue, ReducerEvent, Identity } from "@clockworklabs/spacetimedb-sdk";

export class User extends IDatabaseTable
{
	public static tableName = "User";
	public identity: Identity;
	public name: string | null;
	public online: boolean;

	public static primaryKey: string | undefined = "identity";

	constructor(identity: Identity, name: string | null, online: boolean) {
	super();
		this.identity = identity;
		this.name = name;
		this.online = online;
	}

	public static serialize(value: User): object {
		return [
		Array.from(value.identity.toUint8Array()), value.name ? { "some": value.name } : { "none": [] }, value.online
		];
	}

	public static getAlgebraicType(): AlgebraicType
	{
		return AlgebraicType.createProductType([
			new ProductTypeElement("identity", AlgebraicType.createProductType([
			new ProductTypeElement("__identity_bytes", AlgebraicType.createArrayType(AlgebraicType.createPrimitiveType(BuiltinType.Type.U8))),
		])),
			new ProductTypeElement("name", AlgebraicType.createSumType([
			new SumTypeVariant("some", AlgebraicType.createPrimitiveType(BuiltinType.Type.String)),
			new SumTypeVariant("none", AlgebraicType.createProductType([
		])),
		])),
			new ProductTypeElement("online", AlgebraicType.createPrimitiveType(BuiltinType.Type.Bool)),
		]);
	}

	public static fromValue(value: AlgebraicValue): User
	{
		let productValue = value.asProductValue();
		let __identity = new Identity(productValue.elements[0].asProductValue().elements[0].asBytes());
		let __name = productValue.elements[1].asSumValue().tag == 1 ? null : productValue.elements[1].asSumValue().value.asString();
		let __online = productValue.elements[2].asBoolean();
		return new this(__identity, __name, __online);
	}

	public static count(): number
	{
		return __SPACETIMEDB__.clientDB.getTable("User").count();
	}

	public static all(): User[]
	{
		return __SPACETIMEDB__.clientDB.getTable("User").getInstances() as unknown as User[];
	}

	public static filterByIdentity(value: Identity): User | null
	{
		for(let instance of __SPACETIMEDB__.clientDB.getTable("User").getInstances())
		{
			if (instance.identity.isEqual(value)) {
				return instance;
			}
		}
		return null;
	}

	public static filterByOnline(value: boolean): User[]
	{
		let result: User[] = [];
		for(let instance of __SPACETIMEDB__.clientDB.getTable("User").getInstances())
		{
			if (instance.online === value) {
				result.push(instance);
			}
		}
		return result;
	}


	public static onInsert(callback: (value: User, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("User").onInsert(callback);
	}

	public static onUpdate(callback: (oldValue: User, newValue: User, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("User").onUpdate(callback);
	}

	public static onDelete(callback: (value: User, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("User").onDelete(callback);
	}

	public static removeOnInsert(callback: (value: User, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("User").removeOnInsert(callback);
	}

	public static removeOnUpdate(callback: (oldValue: User, newValue: User, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("User").removeOnUpdate(callback);
	}

	public static removeOnDelete(callback: (value: User, reducerEvent: ReducerEvent | undefined) => void)
	{
		__SPACETIMEDB__.clientDB.getTable("User").removeOnDelete(callback);
	}

}

export default User;

__SPACETIMEDB__.registerComponent("User", User);
