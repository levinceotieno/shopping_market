# Shopping Market

Welcome to Shopping Market! This is an online shopping platform where users can browse products, add them to the cart, and place orders with delivery options.

## Table of Contents
- [Features](#features)
- [Design](#design)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Dependencies](#dependencies)
- [Technologies Used](#technologies-used)
- [URLs](#urls)
- [Authors](#authors)
- [Contributions](#contributions)
- [License](#license)

## Features
- **User Authentication**: Login and register functionality for users.
- **Product Browsing**: Users can view a list of products with details such as name, price, description, and availability.
- **Cart Management**: Add products to the cart, update quantities, and remove items.
- **Order Placement**: Checkout with delivery options and automatic calculation of delivery time based on location.
- **Order History**: Users can view their past orders.
- **Admin Panel**: Admins can manage products and orders.

## Design

### Layout
- **Header**: Contains navigation links including profile, cart, my orders, and logout options.
- **Product Grid**: Displays products in a grid layout with images, prices, and descriptions.
- **Cart**: Shows items added to the cart, total price, and checkout button.
- **Modals**: Used for delivery information input during the checkout process.

### Styles
- **CSS**: Custom styles for different components, responsive design for various screen sizes.
- **EJS Templates**: Dynamic HTML rendering using embedded JavaScript.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/levinceotieno/shopping_market.git
    cd shopping_market
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Set up the environment variables. Create a `.env` file in the root directory and add the following:
    ```
    DATABASE_URL=your_database_url
    SESSION_SECRET=your_session_secret
    ```

4. Set up your database. The project uses a SQL database. You can use tools like PostgreSQL, MySQL, etc. Ensure your `DATABASE_URL` matches your database configuration.

## Running the Project

1. Start the development server:
    ```bash
    node app.js
    ```

2. Open your browser and navigate to:
    ```
    http://localhost:3000
    ```

## Dependencies

- **Node.js**: JavaScript runtime.
- **Express.js**: Web framework for Node.js.
- **EJS**: Template engine for generating HTML.
- **bcryptjs**: Library for hashing passwords.
- **express-session**: Session middleware for Express.
- **method-override**: Middleware for overriding HTTP methods.
- **multer**: Middleware for handling `multipart/form-data`, used for file uploads.
- **sqlite3**: SQLite library for database interaction.

Additional Python dependencies listed in `requirements.txt`:
- certifi==2022.9.24
- chardet==5.1.0
- dbus-python==1.3.2
- distro==1.8.0
- idna==3.3
- pycairo==1.24.0
- PyGObject==3.46.0
- requests==2.31.0
- six==1.16.0
- urllib3==1.26.16

Install Python dependencies with:
```bash
pip install -r requirements.txt
```

## Technologies Used

- **Node.js** with **Express.js** for the backend.
- **EJS** for templating.
- **SQLite** for the database.
- **CSS** for styling.
- **Heroku** for deployment (upcoming).

## URLs

- [Product Page](http://localhost:3000/products)
- [Admin Add & Remove Products](http://localhost:3000/products/add)
- [User Login](http://localhost:3000/user/login)
- [User Register](http://localhost:3000/user/register)
- [User Profile Page](http://localhost:3000/user/profile)
- [User's Orders List](http://localhost:3000/orders)
- [Admin Updates Placed Orders](http://localhost:3000/orders/admin)

## Authors

- **Levince Otieno**
- **Susan Kimemia**

## Contributions

We welcome contributions to the Shopping Market project. To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Create a new Pull Request.

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Happy Shopping!**
```
