package eu.urbain.demo.service;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import eu.urbain.demo.entity.UserRole;

@Repository
public interface UserRoleRepository extends CrudRepository<UserRole, Long> {

	@Query(value = "delete from UserRole ur where ur.user.id = ?1")
	@Modifying
	@Transactional
	public void deleteByUserId(int id);

}
