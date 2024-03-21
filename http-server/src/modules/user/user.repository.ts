import { collections } from "../../utils/mongodb.utils";
import { UserRecord } from "./dtos/user.dto";
import { UserSchema } from "../../schema/user/user.schema";

export class UserRepository {
  static async getUser(reqUsername: string): Promise<UserRecord | null> {
    const users = collections.users;
    const query = { username: reqUsername };
    const findRes = await users!.findOne(query);
    if (!findRes) return null;
    return UserRecord.fromSchema(findRes as UserSchema);
  }

  static async createUser(newUser: UserRecord) {
    const users = collections.users;
    const userObj = UserRecord.toSchema(newUser);
    const result = await users!.insertOne(userObj);
    if (!result) {
      throw new Error("Failed");
    }
  }
}
