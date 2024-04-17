# from flask import Flask, jsonify
# from pybaseball import lahman

# app = Flask(__name__)

# # Example route to retrieve player names
# @app.route('/player_names', methods=['GET'])
# def get_player_names():
#     # Retrieve player data from Lahman database using pybaseball
#     players = lahman.players()
#     player_names = players['name_common'].tolist()

#     # Return player names as JSON
#     return jsonify(player_names)

# @app.route('/')
# def index():
#     return '''
#     <!DOCTYPE html>
#     <html lang="en">
#     <head>
#     <meta charset="UTF-8">
#     <meta name="viewport" content="width=device-width, initial-scale=1.0">
#     <title>Name Entry Table</title>
#     <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
#     </head>
#     <body>
    
#     <div class="container">
#       <h2>Enter Baseball Players' Names</h2>
#       <table class="table table-bordered">
#         <thead class="thead-light">
#           <tr>
#             <th scope="col">MLB Team</th>
#             <th scope="col">Position</th>
#           </tr>
#         </thead>
#         <tbody>
#           <tr>
#             <td><input type="text" class="form-control playerName" name="playerName1" placeholder="Enter player's name"></td>
#             <td>Catcher</td>
#           </tr>
#           <!-- Add more rows as needed -->
#         </tbody>
#       </table>
#       <button class="btn btn-primary" onclick="submitForm()">Submit</button>
#     </div>
    
#     <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
#     <script>
#     $(document).ready(function() {
#       // Function to retrieve player names dynamically
#       function getPlayerNames(input) {
#         $.ajax({
#           url: '/player_names',
#           method: 'GET',
#           data: { input: input },
#           success: function(response) {
#             var playerNameInput = $(input);
#             var playerList = playerNameInput.next('.player-list');
#             playerList.empty();
#             response.forEach(function(playerName) {
#               playerList.append('<option value="' + playerName + '">' + playerName + '</option>');
#             });
#           }
#         });
#       }
    
#       // Event listener for input fields
#       $('.playerName').on('input', function() {
#         var input = $(this);
#         var inputValue = input.val();
#         if (inputValue.length >= 3) {
#           getPlayerNames(input);
#         }
#       });
    
#       // Function to submit form
#       function submitForm() {
#         var table = $('.table');
#         var formData = [];
#         table.find('tbody tr').each(function(index, row) {
#           var playerName = $(row).find('.playerName').val();
#           var playerPosition = $(row).find('td:last-child').text();
#           if (playerName) {
#             formData.push({ name: playerName, position: playerPosition });
#           }
#         });
#         console.log(formData);
#         // Here you can send the formData to your API
#       }
#     });
#     </script>
    
#     </body>
#     </html>
#     '''

# if __name__ == '__main__':
#     app.run(debug=True)
