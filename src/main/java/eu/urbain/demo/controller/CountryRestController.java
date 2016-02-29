package eu.urbain.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import eu.urbain.demo.entity.Country;
import eu.urbain.demo.service.CountryRepository;

@RestController
@RequestMapping("/rest/country")
public class CountryRestController {
	
	@Autowired
	private CountryRepository countryRepository;

	@RequestMapping(value = "/getAll", method = RequestMethod.GET)
	public Iterable<Country> getAllCountry() {
		return countryRepository.findAll();
	}

	@RequestMapping(value = "/save", method = RequestMethod.POST)
	public @ResponseBody Country saveCountry(@RequestBody Country country) {
		return countryRepository.save(country);
	}

	@RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
	public void deleteCountry(@PathVariable("id") int id) {
		countryRepository.delete(id);
	}
	
}
