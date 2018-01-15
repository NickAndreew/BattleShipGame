package salvo.salvo;

import com.sun.javafx.collections.MappingChange;
import com.sun.org.apache.xpath.internal.operations.String;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.List;

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
        List<Object> gamesList = gameRepository.findAll()
                .stream()
                .map(game -> (getGameMap(game)))
                .collect(toList());
        dto.put("player", getMapOfPlayer(findPlayerByEmail(authentication.getName())));
        dto.put("games", gamesList);
        return dto;
    }

    @RequestMapping("/gamePlays")
    private List<Object> getGamePlays() {
        return gamePlayRepository.findAll()
                .stream()
                .map(gamePlayer -> (getGameViewMap(gamePlayer)))
                .collect(toList());
    }

    @RequestMapping(path = "/createPlayer", method = RequestMethod.POST)
    private ResponseEntity<Object> createPlayer(String email, String password) {
        if (email.isEmpty()) {
            return new ResponseEntity<>("No email given", HttpStatus.FORBIDDEN);
        }

        if (findPlayerByEmail(email) != null) {
            return new ResponseEntity<>("Name already used", HttpStatus.CONFLICT);
        }

        playerRepository.save(new Player(email, password));
        return new ResponseEntity<>("Player added!", HttpStatus.CREATED);
    }

    @RequestMapping(path = "/createGame", method = RequestMethod.POST)
    private ResponseEntity<Object> createGame(Authentication authentication) {
        if (authentication.isAuthenticated()) {
            Player player = findPlayerByEmail(authentication.getName());
            Game game = gameRepository.save(new Game());
            GamePlay gamePlay = gamePlayRepository.save(new GamePlay(player, game));
            return new ResponseEntity<Object>(gamePlay.getId(), HttpStatus.CREATED);

        }
        return new ResponseEntity<Object> ("Unable to create", HttpStatus.UNAUTHORIZED);
    }

    @RequestMapping(path = "/games/{game_id}/players", method = RequestMethod.POST)
    private ResponseEntity<Object> joinGame (Authentication authentication, @PathVariable long game_id){
        if(authentication.isAuthenticated()){
            if(findGameById(game_id)!= null && findGameById(game_id).getGamePlays().size()==1 && !checkGamePlaysForPlayerEmail(findGameById(game_id), authentication.getName())){
                Game game = findGameById(game_id);
                GamePlay gamePlay = gamePlayRepository.save(new GamePlay(findPlayerByEmail(authentication.getName()), game));
                return new ResponseEntity<>(gamePlay.getId(), HttpStatus.CREATED);
            } else if(findGameById(game_id).getGamePlays().size()==2){
                return new ResponseEntity<Object>("The game is full", HttpStatus.FORBIDDEN);
            }
        } else {
            return new ResponseEntity<Object>("User is Unauthorised", HttpStatus.UNAUTHORIZED);
        }
        return null;
    }

    @RequestMapping(path = "/gamePlays/{gamePlay_ID}/ships", method = RequestMethod.POST)
    private ResponseEntity<Object> addShip (Authentication authentication, @RequestBody List<Ship> ships, @PathVariable Long gamePlay_ID){
        if(authentication.isAuthenticated()){
            GamePlay gamePlay = gamePlayRepository.findOne(gamePlay_ID);
            for(int i = 0; i <= ships.size()-1 ; i++){
                Ship ship = ships.get(i);
                if(gamePlay.getShips().size()!=5){
                    ship.setGamePlay(gamePlay);
                    gamePlay.addShip(ship);
                    shipsRepository.save(ship);
                }
            }
            return new ResponseEntity<>("Ship has been added", HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("User is Unauthorised", HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping(path = "/players/{gamePlay_ID}/salvos", method = RequestMethod.POST)
    private ResponseEntity<Object> addSalvo (Authentication authentication, @RequestBody Salvo salvo, @PathVariable Long gamePlay_ID){
        if(authentication.isAuthenticated()){
            GamePlay gamePlay = gamePlayRepository.findOne(gamePlay_ID);
            salvo.setGamePlay(gamePlay);
            salvosRepository.save(salvo);
            return new ResponseEntity<>("Salvo has been added", HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("User is Unauthorised", HttpStatus.UNAUTHORIZED);
        }
    }


    private boolean checkGamePlaysForPlayerEmail(Game game, String email){
        List<GamePlay> list = game.getGamePlays().stream().collect(toList());
        for(int i = 0 ; i<=list.size()-1 ; i++){
            if(list.get(i).getPlayer().getEmail()==email){
                return true;
            }
        }
        return false;
    }

    @RequestMapping("/game_view/{gamePlayId}")
    private Map<String, Object> getGamePlayer(@PathVariable long gamePlayId, Authentication authentication) {
        Player player = null;
        GamePlay gamePlay = gamePlayRepository.findOne(gamePlayId);
         if(gamePlay.getPlayer().getEmail() == authentication.getName()){
            player = gamePlay.getPlayer();
            if(authentication.isAuthenticated() && (authentication.getName() == player.getEmail())) {
                return getGameViewMap(gamePlayRepository.findOne(gamePlayId));
            }
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
        List<String> locationsList = salvo.getLocations();

        GamePlay enemyGamePlay = findGamePlayByPlayerEmail(salvo.getGamePlay().getEnemy().getEmail());

        List<Ship> ships = enemyGamePlay.getShips().stream().collect(toList());

        int carrier = 0;
        int battleship = 0;
        int submarine = 0;
        int destroyer = 0;
        int patrol_boat = 0;

        List<Map<String, Object>> hitsAndMisses = new ArrayList<>();

        for (int j = 0 ; j <= ships.size()-1 ; j++) {
            for (int i = 0; i <= locationsList.size()-1 ; i++) {
                if (ships.get(j).getLocation().contains(locationsList.get(i))) {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("ship", ships.get(j).getType());
                    dto.put("shot", "hit");
                    if (ships.get(j).getType().equals(Ship.Type.CARRIER)) {
                        carrier++;
                        if (carrier == 5) {
                            dto.put("condition", "sunked");
                        } else {
                            dto.put("condition", "damaged");
                        }
                    } else if (ships.get(j).getType().equals(Ship.Type.BATTLESHIP)) {
                        battleship++;
                        if (battleship == 4) {
                            dto.put("condition", "sunked");
                        } else {
                            dto.put("condition", "damaged");
                        }
                    } else if (ships.get(j).getType().equals(Ship.Type.SUBMARINE)) {
                        submarine++;
                        if(submarine == 3){
                            dto.put("condition", "sunked");
                        } else {
                            dto.put("condition", "damaged");
                        }
                    } else if (ships.get(j).getType().equals(Ship.Type.DESTROYER)) {
                        destroyer++;
                        if (destroyer==3) {
                            dto.put("condition", "sunked");
                        } else {
                            dto.put("condition", "damaged");
                        }
                    } else if (ships.get(j).getType().equals(Ship.Type.PATROL_BOAT)) {
                        patrol_boat++;
                        if (patrol_boat==2) {
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

        for (int i = 0 ; i <= locationsList.size()-1 ; i++) {
            for (int j = 0; j <= hitsAndMisses.size() - 1; j++) {
                if (hitsAndMisses.get(j).get("location") == locationsList.get(i)) {
                    locationsList.remove(i);
                }
            }
        }

        for(int i = 0; i <= locationsList.size()-1 ; i++){
            Map<String, Object> dto = new HashMap<>();
            dto.put("shot", "miss");
            dto.put("location", locationsList.get(i));
            hitsAndMisses.add(dto);
        }

        return hitsAndMisses;
    }

    private List<String> countShipHits (GamePlay gamePlay){
        List<Map<String, Object>> allShipsLocations = new ArrayList<>();
        gamePlay.getEnemyGamePlay().getShips().forEach(ship -> {
            ship.getLocation().forEach(loc ->{
                Map<String, Object> dto = new HashMap<>();
                dto.put("type", ship.getType().toString());
                dto.put("location", loc);
                allShipsLocations.add(dto);
            });
        });

        List<String> allSalvoLocations = new ArrayList<>();
        gamePlay.getSalvos().forEach(salvo -> {
            salvo.getLocations().forEach(loc ->{
                allSalvoLocations.add(loc);
            });
        });

        List<String> damagedShips = new ArrayList<>();

        for(int i = 0; i<= allShipsLocations.size()-1; i++ ){
            if(allSalvoLocations.contains(allShipsLocations.get(i).get("location"))){
                damagedShips.add(allShipsLocations.get(i));
            }
        }

        System.out.println(damagedShips);

        return damagedShips;
    }

    private GamePlay findGamePlayByPlayerEmail(String playerEmail){
        GamePlay gamePlay = null;
        List<GamePlay> gpList = gamePlayRepository.findAll()
                .stream()
                .collect(toList());
        for(int i = 0; i <= gpList.size()-1 ; i++){
            if(gpList.get(i).getPlayer().getEmail()==playerEmail){
                gamePlay = gpList.get(i);
            }
        }
        return gamePlay;
    }

    private Player findPlayerByEmail(String email){
        List<Player> list = playerRepository.findAll();
        for(int i = 0; i <= list.size()-1; i++){
            Player player = list.get(i);
            if(player.getEmail()== email){
                return player;
            }
        }
        return null;
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

    private Map<String, Object> getGameViewMap(GamePlay gamePlay){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("game_id", gamePlay.getGame().getId());
        dto.put("gamePlay_id", gamePlay.getId());
        dto.put("started", gamePlay.getDate());
        dto.put("player", getMapOfPlayer(gamePlay.getPlayer()));
        if(gamePlay.getEnemy()!=null) {
            dto.put("enemy", getMapOfPlayer(gamePlay.getEnemy()));
        } else if(gamePlay.getEnemy()==null){
            dto.put("enemy", "");
        }
        dto.put("ships", getShipsList(gamePlay));
        dto.put("your_salvos", getSalvosListMapped(gamePlay));
        if(gamePlay.getEnemy()!=null) {
            dto.put("enemies_salvos", getSalvosListMapped(gamePlay.getEnemyGamePlay()));
        } else if(gamePlay.getEnemy()==null){
            dto.put("enemies_salvos", "");
        }
        return dto;
    }

    private Map<String, Object> getGameViewScoreMap(GamePlay gamePlay){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("game_id", gamePlay.getGame().getId());
        dto.put("gamePlay_id", gamePlay.getId());
        dto.put("score", gamePlay.getScore().getScore());
        dto.put("started", gamePlay.getDate());
        dto.put("player", getMapOfPlayer(gamePlay.getPlayer()));
        dto.put("enemy", getMapOfPlayer(gamePlay.getEnemy()));
        return dto;
    }

    private Map<String, Object> getMapOfShip(Ship ship){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", ship.getId());
        dto.put("type", ship.getType());
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
