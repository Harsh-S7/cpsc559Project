import { UserSchema } from "../../../schema/user/user.schema";

export class UserRecord {
  username: string;
  email: string;

  static fromSchema(data: UserSchema): UserRecord {
    return {
      username: data.username,
      email: data.email,
    };
  }

  static toSchema(data: UserRecord): UserSchema {
    return {
      username: data.username,
      email: data.email,
    };
  }
}

export class PostUserReqDto {
  username: string;
  email: string;
}
