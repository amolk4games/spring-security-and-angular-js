package eu.urbain.demo.service;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import eu.urbain.demo.entity.User;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
	
	@Query(value = "select u from User u")
	public Iterable<User> findAll();
	
	@Query(value = "delete from User u where u.userid = ?1")
	@Modifying
	@Transactional
	void delete(int id);

}
