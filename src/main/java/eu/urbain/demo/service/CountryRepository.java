package eu.urbain.demo.service;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import eu.urbain.demo.entity.Country;

@Repository
public interface CountryRepository extends CrudRepository<Country, Long> {
	
	
	@Query(value = "delete from Country c where c.id = ?1")
	@Modifying
	@Transactional
	void delete(int id);
	
	@Query(value = "select max(c.id) from Country c")
	int getMaxId();

}
