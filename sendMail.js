<div class="container">
                        <h1 class="mt-4">Product List</h1>
                        <table class="table table-bordered table-striped mt-4" id="user-table">
                            <thead class="thead-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Photo</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <% users.forEach(user => { %>
                                    <tr>
                                        <td><%= user._id %></td>
                                        <td><%= user.main-photo%></td>
                                        <td><%= user.name%></td>
                                        <td><%= user.price%></td>
                                        <td><%= user.stock%></td>
                                        <td><%= user.status%></td>
                                        <td id="status-<%= user._id %>"><%= user.status %></td>
                                        <td>
                                            <button class="btn<%= user.status === 'Unblocked' ? ' red-button' : (user.status === 'Blocked' ? ' green-button' : '') %>" onclick="toggleUserStatus('<%= user._id %>', '<%= user.status %>')">
                                                <% if (user.status === 'Blocked') { %>
                                                    Unblock
                                                <% } else { %>
                                                    Block
                                                <% } %>
                                            </button>
                                        </td>
                                                                            </tr>
                                <% }); %>
                            </tbody>
                        </table>
                    </div>

                    <script>
                        function toggleUserStatus(userId, currentStatus) {
                            const statusElement = document.querySelector(`#status-${userId}`);
                            
                            // Toggle the user's status
                            const newStatus = currentStatus === 'Blocked' ? 'Unblocked' : 'Blocked';
                        
                            // Update the user's status in your database (use an API call or Mongoose).
                            // For example, using an API call with the Fetch API:
                            fetch(`/update-user-status/${userId}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ status: newStatus }),
                            })
                            .then(response => {
                                if (response.ok) {
                                    return response.json();
                                } else {
                                    // Handle the error
                                    console.error('Error updating user status');
                                }
                            })
                            .then(data => {
                                // Update the button's text with the new status from the response
                                statusElement.textContent = data.status;
                                // Reload the page to reflect the updated status
                                location.reload();
                            })
                            .catch(error => {
                                console.error(error);
                            });
                        }
                        </script>
<!-- for pagination and searching -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
<script>
    $(document).ready(function () {
        new DataTable('#user-table');

    })
</script>