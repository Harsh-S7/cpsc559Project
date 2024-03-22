import { ObjectId } from "mongodb";
import { PostUserReqDto, UserRecord } from "./dtos/user.dto";
import { UserRepository } from "./user.repository";

export class UserService {
  static async getUser(username: string): Promise<UserRecord | undefined> {
    const user = await UserRepository.getUser(username);
    if (!user) throw new Error();
    return user;
  }
  
  static async createUser(newUser: PostUserReqDto) {
    const userId = newUser.username;
    const match = await UserRepository.getUser(userId);
    if(match) throw new Error();
    const user : UserRecord = {
      username: newUser.username,
      email: newUser.email
   }
    
    await UserRepository.createUser(user); 
  }
}
