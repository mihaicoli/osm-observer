from flask import jsonify, request
from flask_login import current_user, login_required

from osm_observer.views import api
from osm_observer.extensions import db
from osm_observer.model import Review


@api.route('/reviews/<int:changeset_id>')
@login_required
def reviews(changeset_id):
    query = Review.query.filter(Review.changeset_id == changeset_id)
    reviews = query.all()
    return jsonify([i.serialize for i in reviews])


@api.route('/reviews/<int:changeset_id>/add', methods=["POST"])
@login_required
def add_review(changeset_id):
    data = request.json
    review = Review(
        changeset_id=changeset_id,
        status=data.get('status'),
        comment=data.get('comment'),
        user_id=current_user.id
    )
    db.session.add(review)
    db.session.commit()

    return jsonify(review.serialize)
