package salvo.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configurers.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.lang.reflect.Array;
import java.util.Date;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class SalvoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(PlayerRepository playerRepository, GameRepository gameRepository, GamePlayRepository gamePlayRepository, ShipsRepository shipsRepository, SalvoRepository salvoRepository, ScoreRepository scoreRepository){
		return (String... args) -> {
//			Player player1 = playerRepository.save(new Player("name1@mail.com", "qwerty"));
//			Player player2 = playerRepository.save(new Player("name2@mail.com", "qwerty"));
//			Player player3 = playerRepository.save(new Player("stupidPlayer@mail.com", "qwerty"));
//			Player player4 = playerRepository.save(new Player("stupidPlayer1@mail.com", "qwerty"));
//
//			Game game1 = gameRepository.save(new Game());
//			Game game2 = gameRepository.save(new Game());
//
//			List<String> one1 = Arrays.asList("A1","A2", "A3", "A4", "A5");
//			List<String> two1 = Arrays.asList("B3", "B4", "B5", "B6");
//			List<String> three1 = Arrays.asList("C8", "C9", "C10");
//			List<String> four1 = Arrays.asList("G5", "G4", "G3");
//			List<String> five1 = Arrays.asList("J5", "J6");
//
//			List<String> one2 = Arrays.asList("F1","F2", "F3", "F4", "F5");
//			List<String> two2 = Arrays.asList("B6", "B7", "B8", "B9");
//			List<String> three2 = Arrays.asList("E5", "E6", "E7");
//			List<String> four2 = Arrays.asList("C5", "C6", "C7");
//			List<String> five2 = Arrays.asList("D5", "D6");
//
//			GamePlay gamePlay1 = gamePlayRepository.save(new GamePlay(player1, game1));
//			GamePlay gamePlay2 = gamePlayRepository.save(new GamePlay(player2, game1));
//
//			GamePlay gamePlay3 = new GamePlay(player3, game2);
//			gamePlay3.setType(true);
//			gamePlayRepository.save(gamePlay3);
//			GamePlay gamePlay4 = gamePlayRepository.save(new GamePlay(player4, game2));
//
//			Ship shipOne = shipsRepository.save(new Ship(one1, "carrier"));
//			Ship shipTwo = shipsRepository.save(new Ship(two1, "battleship"));
//			Ship shipThree = shipsRepository.save(new Ship(three1, "submarine"));
//			Ship shipFour = shipsRepository.save(new Ship(four1, gamePlay1.getId(), "destroyer"));
//			Ship shipFive = shipsRepository.save(new Ship(five1, gamePlay1.getId(), "patrol_boat"));
//
//			Ship shipOne1 = shipsRepository.save(new Ship(one2, gamePlay2.getId(), "carrier"));
//			Ship shipTwo1 = shipsRepository.save(new Ship(two2, gamePlay2.getId(), "battleship"));
//			Ship shipThree1 = shipsRepository.save(new Ship(three2, gamePlay2.getId(), "submarine"));
//			Ship shipFour1 = shipsRepository.save(new Ship(four2, gamePlay2.getId(), "destroyer"));
//			Ship shipFive1 = shipsRepository.save(new Ship(five2, gamePlay2.getId(), "patrol_boat"));

//			List<String> salvoLocation1 = Arrays.asList("D5", "E5");
//			List<String> salvoLocation2 = Arrays.asList("C3","C4", "C5");
//			List<String> salvoLocation3 = Arrays.asList("E6","E7","E8");
//
//			List<String> salvoLocation4 = Arrays.asList("I5", "J5");
//			List<String> salvoLocation5 = Arrays.asList("D3","D4", "D5");
//			List<String> salvoLocation6 = Arrays.asList("A6","A7","A8");
//
//			Salvo salvo1 = salvoRepository.save(new Salvo(salvoLocation1, gamePlay1, 1));
//			Salvo salvo4 = salvoRepository.save(new Salvo(salvoLocation4, gamePlay2, 1));
//
//			Salvo salvo2 = salvoRepository.save(new Salvo(salvoLocation2, gamePlay1, 2));
//			Salvo salvo5 = salvoRepository.save(new Salvo(salvoLocation5, gamePlay2, 2));
//
//			Salvo salvo3 = salvoRepository.save(new Salvo(salvoLocation3, gamePlay1, 3));
//			Salvo salvo6 = salvoRepository.save(new Salvo(salvoLocation6, gamePlay2, 3));


		};
	}
}

@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

	@Autowired
	PlayerRepository playerRepository;

	@Override
	public void init(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userDetailsService());
	}

	@Bean
	UserDetailsService userDetailsService() {
		return new UserDetailsService() {

			@Override
			public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
				List<Player> players = playerRepository.findByEmail(name);
				if (!players.isEmpty()) {
					Player player = players.get(0);
					return new User(player.getEmail(), player.getPassword(),
							AuthorityUtils.createAuthorityList("USER"));
				} else {
					throw new UsernameNotFoundException("Unknown user: " + name);
				}
			}
		};
	}
}

@EnableWebSecurity
@Configuration
class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.authorizeRequests()
				.antMatchers("/web/authentication.html").permitAll()
				.antMatchers("/web/style.css").permitAll()
				.antMatchers("/web/authentication.js").permitAll()
				.antMatchers("/api/games").permitAll()
				.antMatchers("/api/createPlayer").permitAll()
				.anyRequest().fullyAuthenticated();



		http.formLogin()
				.usernameParameter("email")
				.passwordParameter("password")
				.loginPage("/api/login");

		http.logout().logoutUrl("/api/logout");

		// turn off checking for CSRF tokens
		http.csrf().disable();

		// if user is not authenticated, just send an authentication failure response
		http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if login is successful, just clear the flags asking for authentication
		http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

		// if login fails, just send an authentication failure response
		http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if logout is successful, just send a success response
		http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());
	}

	private void clearAuthenticationAttributes(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
		}
	}
}
