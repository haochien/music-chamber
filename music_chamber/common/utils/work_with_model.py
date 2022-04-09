


class WorkWithModel():

    @staticmethod
    def create_or_update_model(model, list_model_fields, list_model_values, edit_type='create', queryset=None):
        data = dict(zip(list_model_fields, list_model_values))

        if edit_type == 'create':
            instance = model.objects.create(**data)
        elif edit_type == 'update':
            queryset.update(**data)
            instance = queryset
        return instance



