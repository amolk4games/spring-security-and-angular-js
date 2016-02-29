package eu.urbain.demo.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import eu.urbain.demo.entity.User;
import eu.urbain.demo.entity.UserRole;
import eu.urbain.demo.service.UserRepository;
import eu.urbain.demo.service.UserRoleRepository;

@RestController
@RequestMapping("/admin/rest/user")
public class UserRestController {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private UserRoleRepository userRoleRepository;

	@RequestMapping(value = "/getAll", method = RequestMethod.GET)
	public Iterable<User> getAllUser() {
		return userRepository.findAll();
	}

	@RequestMapping(value = "/save", method = RequestMethod.POST)
	public @ResponseBody User saveUser(@RequestBody User user) {
		if (user.getUserid() != 0) {
			userRoleRepository.deleteByUserId(user.getUserid());
			List<UserRole> newListUserRole = new ArrayList<UserRole>();
			for (UserRole userRole : user.getUserRoles()) {
				userRole.setUser(user);
				newListUserRole.add(userRoleRepository.save(userRole));
			}
			user.setUserRoles(newListUserRole);
			return userRepository.save(user);
		} else {
			User savedUser = userRepository.save(user);
			List<UserRole> newListUserRole = new ArrayList<UserRole>();
			for (UserRole userRole : user.getUserRoles()) {
				userRole.setUser(savedUser);
				newListUserRole.add(userRoleRepository.save(userRole));
			}
			savedUser.setUserRoles(newListUserRole);
			return savedUser;
		}
	}

	@RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
	public void deleteUser(@PathVariable("id") int id) {
		userRoleRepository.deleteByUserId(id);
		userRepository.delete(id);
	}
}
