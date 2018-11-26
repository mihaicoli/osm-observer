import datetime

from flask import jsonify, request, current_app
from flask_login import login_user, logout_user, current_user

from osm_observer.model import User
from osm_observer.extensions import db

from osm_observer.views import api


class MESSAGE_ID(object):
    ALREADY_LOGGED_IN = 0
    LOGGED_OUT = 1
    LOGGED_IN = 2
    LDAP_LOGIN_FAILED = 3
    INVALID_CREDENTIALS = 4


@api.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return jsonify({
            'message': 'Already logged in',
            'success': True,
            'messageId': MESSAGE_ID.ALREADY_LOGGED_IN
        })

    data = request.json

    json_response = None

    if current_app.config['LDAP_ENABLED']:
        json_response = ldap_login(data['username'], data['password'])
    else:
        json_response = local_login(data['username'], data['password'])

    print(json_response)

    response = jsonify(json_response)

    if json_response['success'] is True:
        response.set_cookie('loggedIn', '1')

    return response


@api.route('/logout')
def logout():
    logout_user()
    response = jsonify({
        'message': 'Logged out successfully',
        'success': True,
        'messageId': MESSAGE_ID.LOGGED_OUT
    })
    response.set_cookie('loggedIn', '', expires=0)
    return response


def ldap_login(username, password):
    if User.try_ldap_login(username, password):
        user = User.by_username(username)
        if User.by_username(username) is None:
            user = User(username)
            db.session.add(user)
            user.last_login = datetime.datetime.utcnow()
            db.session.commit()
        login_user(user)
        return dict(
            message='Logged in successfully',
            success=True,
            messageId=MESSAGE_ID.LOGGED_IN
        )
    return dict(
        message='LDAP login faild',
        success=False,
        messageId=MESSAGE_ID.LDAP_LOGIN_FAILED
    )


def local_login(username, password):
    user = User.by_username(username)
    if user is not None and user.check_password(password):
        user.last_login = datetime.datetime.utcnow()
        db.session.commit()
        login_user(user)
        return dict(
            message='Logged in successfully',
            success=True,
            messageId=MESSAGE_ID.LOGGED_IN
        )

    return dict(
        message='Invalid username or password',
        success=False,
        messageId=MESSAGE_ID.INVALID_CREDENTIALS
    )
