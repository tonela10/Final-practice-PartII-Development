import {Service} from "typedi";
import {UserRepository} from "./user.repository";

@Service()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {
    }

    async searchUsers(filters: { role?: string; name?: string; email?: string }) {
        return await this.userRepository.searchUsers(filters);
    }
}
