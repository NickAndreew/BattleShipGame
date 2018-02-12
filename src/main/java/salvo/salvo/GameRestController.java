package salvo.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

@RestController
@RequestMapping("/api")
public class GameRestController {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GamePlayRepository gamePlayRepository;

    @Autowired
    private ShipsRepository shipsRepository;

    @Autowired
    private SalvoRepository salvosRepository;

    @Autowired
    private ScoreRepository scoreRepository;

    @RequestMapping("/players")
    private List<Object> getPlayers() {
        return playerRepository.findAll()
                .stream()
                .map(player -> (getMapOfPlayer(player)))
                .collect(toList());
    }

    @RequestMapping("/games")
    private Map<String, Object> getGames(Authentication authentication) {
        Map<String, Object> dto = new HashMap<>();
        if(authentication!=null){
            List<Object> gamesList = gameRepository.findAll()
                    .stream()
                    .map(game -> (getGameMap(game)))
                    .collect(toList());
            if (findPlayerByEmail(authentication.getName()) == null) {
                dto.put("player", "");
            } else if (findPlayerByEmail(authentication.getName()) != null) {
                dto.put("player", getMapOfPlayer(findPlayerByEmail(authentication.getName())));
            }
            dto.put("games", gamesList);
            return dto;
        } else {
            dto.put("player", "");
            return dto;
        }
    }

    @RequestMapping("/gamePlays")
    private List<Object> getGamePlays() {
        return gamePlayRepository.findAll()
                .stream()
                .map(gamePlayer -> (getGameViewMap(gamePlayer)))
                .collect(toList());
    }

    @RequestMapping(path = "/createPlayer", method = RequestMethod.POST)
    private ResponseEntity<String> createPlayer(String email, String password) {
        String response = "No email given.";
        if (email.isEmpty()) {
            return new ResponseEntity<String>(response, HttpStatus.FORBIDDEN);
        }

        if (playerRepository.findByEmail(email).size()==0) {
            playerRepository.save(new Player(email, password));
            response = "Player added!";
            return new ResponseEntity<String>(response, HttpStatus.CREATED);
        } else {
            response = "Name is already in use.";
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }

    }

    @RequestMapping(path = "/createGame", method = RequestMethod.POST)
    private ResponseEntity<Object> createGame(Authentication authentication) {
        if (authentication.isAuthenticated()) {
            Player player = findPlayerByEmail(authentication.getName());
            Game game = gameRepository.save(new Game());

            GamePlay gamePlay = new GamePlay(player, game);
            gamePlay.setType(true);
            System.out.println(gamePlay.getType());
            gamePlayRepository.save(gamePlay);
            return new ResponseEntity<Object>(gamePlay.getId(), HttpStatus.CREATED);

        }
        return new ResponseEntity<Object> ("Unable to create", HttpStatus.UNAUTHORIZED);
    }

    @RequestMapping(path = "/games/{game_id}/players", method = RequestMethod.POST)
    private ResponseEntity<Object> joinGame (Authentication authentication, @PathVariable long game_id){
        if(authentication.isAuthenticated()){
            if(findGameById(game_id)!= null && findGameById(game_id).getGamePlays().size()==1 && checkGamePlaysForPlayerEmail(findGameById(game_id), authentication.getName())){
                Game game = findGameById(game_id);
                GamePlay gamePlay = new GamePlay(findPlayerByEmail(authentication.getName()), game);
                System.out.println(gamePlay.getType());
                gamePlayRepository.save(gamePlay);
                return new ResponseEntity<>(gamePlay.getId(), HttpStatus.CREATED);
            } else if(findGameById(game_id).getGamePlays().size()==2){
                String response = "The game is full!";
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }
        } else {
            String response = "User is unauthorised";
            return new ResponseEntity<Object>(response, HttpStatus.UNAUTHORIZED);
        }
        return null;
    }

    @RequestMapping(path = "/gamePlays/{gamePlay_ID}/ships", method = RequestMethod.POST)
    private ResponseEntity<String> addShips (Authentication authentication, @RequestBody List<Ship> ships, @PathVariable Long gamePlay_ID){
        if(authentication.isAuthenticated()){
            GamePlay gamePlay = gamePlayRepository.findOne(gamePlay_ID);
            for(int i = 0; i <= ships.size()-1 ; i++){
                Ship ship = ships.get(i);
                if(gamePlay.getShips().size()<5){
                    ship.setGamePlay(gamePlay);
                    gamePlay.addShip(ship);
                    shipsRepository.save(ship);
                }
            }
            String response = "Ships have been placed!";
            return new ResponseEntity<String>(response, HttpStatus.CREATED);
        } else {
            String response = "Ships are there, captain!";
            return new ResponseEntity<String>(response, HttpStatus.FORBIDDEN);
        }
    }

    @RequestMapping(path = "/players/{gamePlay_ID}/salvos", method = RequestMethod.POST)
    private ResponseEntity<String> addSalvo (Authentication authentication, @RequestBody Salvo salvo, @PathVariable Long gamePlay_ID){
        String response = "";
        GamePlay gamePlay = gamePlayRepository.findOne(gamePlay_ID);
        if(authentication.isAuthenticated() && gamePlay.getEnemyGamePlay()!=null && gamePlay!=null){
            if(checkTheTurn(gamePlay)) {
                salvo.setTurn(gamePlay.getLastTurn() + 1);

                if(!gamePlay.getShips().isEmpty() && !gamePlay.getEnemyGamePlay().getShips().isEmpty()){
                    gamePlay.addSalvo(salvo);
                    salvosRepository.save(salvo);

                    List<String> locationsList = new ArrayList<>(salvo.getLocations());

                    GamePlay enemyGamePlay = salvo.getGamePlay().getEnemyGamePlay();

                    List<Ship> ships = new ArrayList<>(enemyGamePlay.getShips());
                    List<String> salvoLocations = getSalvoLocations(gamePlay, salvo);

                    for (int j = 0 ; j <= ships.size()-1 ; j++) {
                        for (int i = 0; i <= locationsList.size()-1 ; i++) {
                            if (ships.get(j).getLocation().contains(locationsList.get(i))) {
                                if (ships.get(j).getType().equals(Ship.Type.CARRIER)) {
                                    salvoLocations.add(locationsList.get(i));
                                    if (shipIsSunk(salvoLocations, ships.get(j))) {
                                        ships.get(j).setSunk();
                                        shipsRepository.save(ships.get(j));
                                    }
                                } else if (ships.get(j).getType().equals(Ship.Type.BATTLESHIP)) {
                                    salvoLocations.add(locationsList.get(i));
                                    if (shipIsSunk(salvoLocations, ships.get(j))) {
                                        ships.get(j).setSunk();
                                        shipsRepository.save(ships.get(j));
                                    }
                                } else if (ships.get(j).getType().equals(Ship.Type.SUBMARINE)) {
                                    salvoLocations.add(locationsList.get(i));
                                    if(shipIsSunk(salvoLocations, ships.get(j))){
                                        ships.get(j).setSunk();
                                        shipsRepository.save(ships.get(j));
                                    }
                                } else if (ships.get(j).getType().equals(Ship.Type.DESTROYER)) {
                                    salvoLocations.add(locationsList.get(i));
                                    if (shipIsSunk(salvoLocations, ships.get(j))) {
                                        ships.get(j).setSunk();
                                        shipsRepository.save(ships.get(j));
                                    }
                                } else if (ships.get(j).getType().equals(Ship.Type.PATROL_BOAT)) {
                                    salvoLocations.add(locationsList.get(i));
                                    if (shipIsSunk(salvoLocations, ships.get(j))) {
                                        ships.get(j).setSunk();
                                        shipsRepository.save(ships.get(j));
                                    }
                                }
                            }
                        }
                    }

                    if (checkGameOver(gamePlay)) {
                        Player enemy = enemyGamePlay.getPlayer();
                        Game game = enemyGamePlay.getGame();
                        Player player = enemyGamePlay.getEnemy();
                        System.out.println("Game over, not scored yet.");
                        if(addScore(game, player, gamePlay, enemy, enemyGamePlay)) {
                            System.out.println("Game has been scored!");
                        }
                    } else {
                        System.out.println("Game continues! Salvo added.");
                    }

                    response = "Fire!!!";
                    return new ResponseEntity<>(response, HttpStatus.CREATED);
                } else {
                    response = "We couldn't shoot this time, captain!";
                    return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
                }
            } else {
                response = "Please wait for the other player to shoot..";
                System.out.println("--------------"+response);
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }
        } else {
            response = "Some unknown error happened.";
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }

    private boolean addScore(Game game, Player player, GamePlay gamePlay, Player enemy, GamePlay enemyGamePlay){
        boolean added = false;
        if(shipsAreSunked(gamePlay.getEnemyGamePlay()) | shipsAreSunked(gamePlay)) {
            if(game != null && player != null && gamePlay.getScore()==null && gamePlay.getScore()==null) {
                Score score = new Score(game, player, gamePlay);
                Score enemyScore = new Score(game, enemy, enemyGamePlay);
                if (shipsAreSunked(gamePlay) && !shipsAreSunked(enemyGamePlay)) {

                    score.setScore(0.0);

                    enemyScore.setScore(1.0);

                    added = true;
                } else if (shipsAreSunked(enemyGamePlay) && !shipsAreSunked(gamePlay)) {

                    score.setScore(1.0);

                    enemyScore.setScore(0.0);

                    added = true;
                } else if (shipsAreSunked(enemyGamePlay) && shipsAreSunked(gamePlay)) {

                    score.setScore(0.5);

                    enemyScore.setScore(0.5);

                    added = true;
                }

                scoreRepository.save(score);
                gamePlay.setScore(score);
                scoreRepository.save(enemyScore);
                enemyGamePlay.setScore(enemyScore);

                gamePlayRepository.save(gamePlay);
                gamePlayRepository.save(enemyGamePlay);

                gamePlay.getGame().setOver(true);
                gameRepository.save(gamePlay.getGame());
            }
        }
        return added;
    }

    private boolean checkTheTurn(GamePlay gamePlay){
        if(gamePlay!=null && gamePlay.getScore()==null && gamePlay.getEnemyGamePlay().getScore()==null) {
            //// FOR HOST
            if (gamePlay.getType() && gamePlay.getEnemyGamePlay().getLastTurn() == gamePlay.getLastTurn()) {
                return true;
                //// FOR JOIN
            } else if (!gamePlay.getType() && gamePlay.getEnemyGamePlay().getLastTurn() == gamePlay.getLastTurn() + 1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    private boolean checkGameOver(GamePlay gamePlay){
        if(gamePlay!=null && gamePlay.getEnemyGamePlay()!=null){
            //// FOR HOST
            if (gamePlay.getType()) {
                return false;
            //// FOR JOIN
            } else if (!gamePlay.getType()) {
                if (shipsAreSunked(gamePlay) | shipsAreSunked(gamePlay.getEnemyGamePlay())) {
                    return true;
                }

            } else {
                return false;
            }
        }
        else {
            System.out.println("Game Over check: -- Some GamePlay is null");
            return false;
        }
        return false;
    }


    private boolean checkGamePlaysForPlayerEmail(Game game, String email){
        List<GamePlay> list = game.getGamePlays().stream().collect(toList());
        for(int i = 0 ; i<=list.size()-1 ; i++){
            if(list.get(i).getPlayer().getEmail()==email){
                return false;
            }
        }
        return true;
    }

    @RequestMapping("/game_view/{gamePlayId}")
    private Map<String, Object> getGamePlay(@PathVariable long gamePlayId, Authentication authentication) {

        GamePlay gamePlay = gamePlayRepository.findOne(gamePlayId);

        if (gamePlay.getPlayer()!=null && authentication.isAuthenticated() && gamePlay.getPlayer().getEmail() == authentication.getName()) {
            return getGameViewMap(gamePlay);
        }
        return null;
    }


    @RequestMapping("/shipTypes")
    private List<Object> getListOfShipTypes(){
        List<Ship.Type> shipTypes = Arrays.asList(Ship.Type.values());
        List<Object> shipMapsList = new ArrayList<>();
        for(int i = 0 ; i <= shipTypes.size()-1 ; i++) {
            shipMapsList.add(getMapOfTypes(shipTypes.get(i)));
        }
        return shipMapsList;
    }

    @RequestMapping("/salvoes")
    private List<Object> getListOfSalvoes(){
        return salvosRepository.findAll()
                .stream()
                .map(salvo ->(getSalvoMap(salvo)))
                .collect(toList());
    }

    @RequestMapping("/scores")
    private List<Object> getScoresList(){
        return gameRepository.findAll()
                .stream()
                .map(game -> (getScoresMap(game)))
                .collect(toList());
    }

    @RequestMapping("/leaderboard")
    private List<Object> getLeaderBoard(){
        List<Object> players = playerRepository.findAll()
                .stream()
                .map(player ->(getMapOfPlayerScores(player)))
                .collect(toList());
        return players;
    }

    private List<Map<String, Object>> getMapOfHitsAndMisses(Salvo salvo){
        List<String> locationsList = new ArrayList<>(salvo.getLocations());

        GamePlay enemyGamePlay = salvo.getGamePlay().getEnemyGamePlay();

        List<Ship> ships = new ArrayList<>(enemyGamePlay.getShips());
        List<String> salvoLocations = getSalvoLocations(salvo.getGamePlay(), salvo);

        List<Map<String, Object>> hitsAndMisses = new ArrayList<>();

        for (int j = 0 ; j <= ships.size()-1 ; j++) {
            for (int i = 0; i <= locationsList.size()-1 ; i++) {

                if (ships.get(j).getLocation().contains(locationsList.get(i))) {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("ship", ships.get(j).getType());

                    dto.put("shot", "hit");
                    if (ships.get(j).getType().equals(Ship.Type.CARRIER)) {
                        salvoLocations.add(locationsList.get(i));
                        if (shipIsSunk(salvoLocations, ships.get(j))) {
                            dto.put("condition", "sunked");
                        } else {
                            dto.put("condition", "damaged");
                        }
                    } else if (ships.get(j).getType().equals(Ship.Type.BATTLESHIP)) {
                        salvoLocations.add(locationsList.get(i));
                        if (shipIsSunk(salvoLocations, ships.get(j))) {
                            dto.put("condition", "sunked");

                        } else {
                            dto.put("condition", "damaged");
                        }
                    } else if (ships.get(j).getType().equals(Ship.Type.SUBMARINE)) {
                        salvoLocations.add(locationsList.get(i));
                        if(shipIsSunk(salvoLocations, ships.get(j))){
                            dto.put("condition", "sunked");
                        } else {
                            dto.put("condition", "damaged");
                        }
                    } else if (ships.get(j).getType().equals(Ship.Type.DESTROYER)) {
                        salvoLocations.add(locationsList.get(i));
                        if (shipIsSunk(salvoLocations, ships.get(j))) {
                            dto.put("condition", "sunked");
                        } else {
                            dto.put("condition", "damaged");
                        }
                    } else if (ships.get(j).getType().equals(Ship.Type.PATROL_BOAT)) {
                        salvoLocations.add(locationsList.get(i));
                        if (shipIsSunk(salvoLocations, ships.get(j))) {
                            dto.put("condition", "sunked");
                        } else {
                            dto.put("condition", "damaged");
                        }
                    }

                    dto.put("location", locationsList.get(i));
                    if(!hitsAndMisses.contains(dto)){
                        hitsAndMisses.add(dto);
                    }
                }
            }
        }

        for (int j = 0; j < hitsAndMisses.size(); j++) {
            if (locationsList.contains(hitsAndMisses.get(j).get("location"))) {
                locationsList.remove(hitsAndMisses.get(j).get("location"));
            }
        }

        for (int i = 0; i < locationsList.size() ; i++) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("shot", "miss");
            dto.put("location", locationsList.get(i));
            hitsAndMisses.add(dto);
        }

        return hitsAndMisses;
    }

    private List<String> getShipsLocations(GamePlay gamePlay){
        Set<Ship> ships = gamePlay.getShips();
        List<String> locations = new ArrayList<>();

        ships.forEach(ship -> {
            ship.getLocation().forEach(loc ->{
                locations.add(loc);
            });
        });
        return locations;
    }

    private boolean shipsAreSunked(GamePlay gamePlay) {
        if(gamePlay!=null && gamePlay.getShips().size()!=0){
            List<Ship> ships = new ArrayList<>(gamePlay.getShips());

            boolean shipsAreSunked = ships.stream()
                    .allMatch(ship -> ship.isSunk());

            return shipsAreSunked;
        } else {
            return false;
        }
    }

    private List<String> getSalvoLocations (GamePlay gamePlay, Salvo salvo){
        List<String> locations = new ArrayList<>();

        gamePlay.getSalvos().forEach(salvo1 -> {
            if(salvo1.getTurn() < salvo.getTurn()){
                salvo1.getLocations().forEach(loc -> {
                    locations.add(loc);
                });
            }
        });

        return locations;
    }

    private boolean shipIsSunk (List<String> playerSalvos, Ship ship){

        boolean shipIsSunk = ship.getLocation().stream()
                .allMatch(locations -> playerSalvos.contains(locations));

        return shipIsSunk;
    }


    private Game findGameById(long ID){
        List<Game> games = gameRepository.findAll();
        for(int i = 0; i<= games.size()-1; i++){
            if(games.get(i).getId()==ID){
                return games.get(i);
            }
        }
        return null;
    }

    private Player findPlayerByEmail(String email){
        List<Player> list = new ArrayList<>(playerRepository.findByEmail(email));
        if (list.size()==1){
            return list.get(0);
        } else if(list.size()==0){
            return null;
        } else {
            System.out.println("Few players with given email were found.");
        }
        return list.get(0);
    }

    private Map<String,Object> getMapOfPlayerScores(Player player){
        Map<String, Object> dto = new HashMap<>();
        dto.put("player", getMapOfPlayer(player));
        dto.put("total_scores", player.scoresTotal());
        dto.put("wins_total", player.totalNumberOfWins());
        dto.put("loses_total", player.totalNumberOfLoses());
        dto.put("ties_total", player.totalNumberOfTies());
        return dto;
    }

    private List<Object> getShipsList(GamePlay gamePlay){
        return gamePlay.getShips()
                .stream()
                .map(ship -> (getMapOfShip(ship)))
                .collect(toList());
    }

    private Map<String, Object> getMapOfPlayer(Player player){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", player.getId());
        dto.put("email", player.getEmail());
        return dto;
    }

    private Map<String, Object> getGameMap(Game game){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", game.getId());
        dto.put("created", game.getDate());
        dto.put("over", game.isOver());
        dto.put("gamePlays", getGamePlayListMapped(game.getGamePlays()));
        return dto;
    }

    private List<Object> getGamePlayListMapped (Set<GamePlay> gamePlaysList){
        return gamePlaysList
                .stream()
                .map(gamePlayer -> (getGameViewMap(gamePlayer)))
                .collect(toList());
    }

    private List<Object> getGamePlayListScoreMapped(Set<GamePlay> gamePlaysList){
        return gamePlaysList
                .stream()
                .map(gamePlayer -> (getGameViewScoreMap(gamePlayer)))
                .collect(toList());
    }

    private Map<String, Object> getGameViewMap(GamePlay gamePlay) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("game_id", gamePlay.getGame().getId());
        dto.put("game_over", gamePlay.getGame().isOver());
        dto.put("gamePlay_id", gamePlay.getId());
        dto.put("started", gamePlay.getDate());
        dto.put("player", getMapOfPlayer(gamePlay.getPlayer()));
        String type = "";
        if (gamePlay.getType()==true) {
            type = "host";
        } else if (gamePlay.getType()==false) {
            type = "join";
        }
        if(gamePlay.getScore()!=null){
            dto.put("score", gamePlay.getScore().getScore());
        } else {
            dto.put("score", "");
        }
        dto.put("type", type);


        if(gamePlay.getScore()!=null){
            if (shipsAreSunked(gamePlay) && shipsAreSunked(gamePlay.getEnemyGamePlay())) {
                dto.put("state", "tie");
            } else if (shipsAreSunked(gamePlay.getEnemyGamePlay())) {
                dto.put("state", "won");
            } else if (shipsAreSunked(gamePlay)) {
                dto.put("state", "lost");
            } else {
                dto.put("state", "scored");
            }
        } else if (gamePlay.getShips().size() < 5) {
            dto.put("state", "place_ships");
        } else if (gamePlay.getEnemyGamePlay()==null) {
            dto.put("state", "waiting_for_player_to_join");
        } else if (gamePlay.getEnemyGamePlay()!=null && gamePlay.getEnemyGamePlay().getShips().size() < 5) {
            dto.put("state", "enemy_places_ships");
        } else if (gamePlay.getEnemyGamePlay()!=null && gamePlay.getShips().size() == 5 && gamePlay.getEnemyGamePlay().getShips().size() == 5 && checkTheTurn(gamePlay)) {
            dto.put("state", "your_turn");
        } else if (gamePlay.getEnemyGamePlay()!=null && gamePlay.getShips().size() == 5 && gamePlay.getEnemyGamePlay().getShips().size() == 5 && !checkTheTurn(gamePlay)){
            dto.put("state", "enemy's_turn");
        }

        if (gamePlay.getEnemy() != null) {
            dto.put("enemy", gamePlay.getEnemy().getEmail());

        } else if(gamePlay.getEnemy()==null) {
            dto.put("enemy", "");
        }

        dto.put("ships", getShipsList(gamePlay));
        dto.put("your_salvos", getSalvosListMapped(gamePlay));


        if(gamePlay.getEnemy()!=null) {
            dto.put("enemies_salvos", getSalvosListMapped(gamePlay.getEnemyGamePlay()));
        } else {
            dto.put("enemies_salvos", "");
        }
        return dto;
    }

    private Map<String, Object> getGameViewScoreMap(GamePlay gamePlay){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("gamePlay_id", gamePlay.getId());
        if(gamePlay.getScore()!=null && gamePlay.getScore().getScore()==1.0){
            dto.put("score", 1);
        } else if(gamePlay.getScore()!=null && gamePlay.getScore().getScore()==0.5){
            dto.put("score", 0.5);
        } else if(gamePlay.getScore()!=null && gamePlay.getScore().getScore()==0.0){
            dto.put("score", 0);
        } else {
            dto.put("score", "game is not over");
        }
        dto.put("started", gamePlay.getDate());
        dto.put("player", getMapOfPlayer(gamePlay.getPlayer()));
        if(gamePlay.getEnemy()!=null){
            dto.put("enemy", getMapOfPlayer(gamePlay.getEnemy()));
        } else {
            dto.put("enemy", "");
        }
        return dto;
    }

    private Map<String, Object> getMapOfShip(Ship ship){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", ship.getId());
        dto.put("type", ship.getType());
        dto.put("sunked", ship.isSunk());
        dto.put("location", ship.getLocation());
        return dto;
    }

    private Map<String, Object> getMapOfTypes(Ship.Type type){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("type", type.toString());
        dto.put("length", type.getShipLength());
        return dto;
    }

    private List<Object> getSalvosListMapped(GamePlay gamePlay){
        return gamePlay.getSalvos()
                .stream()
                .sorted(Comparator.comparing(Salvo::getTurn))
                .map(salvo -> (getSalvoMap(salvo)))
                .collect(toList());
    }

    private Map<String, Object> getSalvoMap(Salvo salvo){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", salvo.getId());
        dto.put("player", getMapOfPlayer(salvo.getGamePlay().getPlayer()));
        dto.put("turn", salvo.getTurn());
        dto.put("shots", getMapOfHitsAndMisses(salvo));
        return dto;
    }

    private Map<String, Object> getScoresMap(Game game){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("game_id", game.getId());
        dto.put("game_plays", getGamePlayListScoreMapped(game.getGamePlays()));
        return dto;
    }
}
