from osm_observer.model.review import Review
from osm_observer.model.review_bot_configs import ReviewBotConfig


__all__ = ['UsernameReviewBot', 'TagValueReviewBot']


class BaseReviewBot():

    def __init__(self, connection):
        self.conn = connection
        self.load_config()

    def review(self, changeset):
        raise NotImplementedError

    def load_config(self):
        s = ReviewBotConfig.__table__.select()
        s = s.where(ReviewBotConfig.__table__.c.bot_name == self.__name__)
        s = s.where(ReviewBotConfig.__table__.c.active == True)

        self.configs = {}
        for bot_config in self.conn.execute(s).fetchall():
            config = dict(bot_config)
            self.configs[config['id']] = config['config']

    def __repr__(self):
        return '<%s>' % self.__name__


class UsernameReviewBot(BaseReviewBot):

    __name__ = 'UsernameReviewBot'

    def load_config(self):
        super().load_config()

        self.username_scores = {}
        for config_id, config in self.configs.items():
            self.username_scores[config['username']] = {
                'score': config['score'],
                'comment': config['comment'],
                'config_id': config_id,
            }

    def review(self, changeset):
        username = changeset.user_name
        if username in self.username_scores:
            return Review(
                score=self.username_scores[username]['score'],
                comment=self.username_scores[username]['comment'],
                review_bot_config_id=self.username_scores[username]['config_id'],
            )
        return None


class TagValueReviewBot(BaseReviewBot):

    __name__ = 'TagValueReviewBot'

    def load_config(self):
        super().load_config()

        self.tag_value_scores = []

        for config_id, config in self.configs.items():
            c = {'config_id': config_id}
            c.update(config)
            self.tag_value_scores.append(c)

    def review(self, changeset):
        tags = changeset.tags

        for tag_value_score in self.tag_value_scores:
            if tag_value_score['tag'] not in tags:
                continue
            if tags[tag_value_score['tag']].startswith(tag_value_score['value']):
                return Review(
                    score=tag_value_score['score'],
                    comment=tag_value_score['comment'],
                    review_bot_config_id=tag_value_score['config_id'],
                )
        return None
