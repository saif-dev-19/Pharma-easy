from django.contrib.auth import authenticate
from apps.branches.models import Branch
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        attrs["user"] = user
        return attrs



from .models import User


from rest_framework import serializers
from .models import User


class UserManagementSerializer(serializers.ModelSerializer):
    branch = serializers.PrimaryKeyRelatedField(
            queryset=Branch.objects.filter(is_active=True),
            required=False,
            allow_null=True
        )

    branch_name = serializers.CharField(
        source="branch.name",
        read_only=True
    )

    password = serializers.CharField(
        write_only=True,
        required=False
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "branch",
            "branch_name",
            "is_active",
            "date_joined",
        ]

        read_only_fields = [
            "id",
            "branch_name",
            "date_joined",
        ]

    # এই validate() এখানে
    def validate(self, attrs):
        role = attrs.get(
            "role",
            self.instance.role if self.instance else None
        )

        branch = attrs.get(
            "branch",
            self.instance.branch if self.instance else None
        )

        if role in [
            User.Role.MANAGER,
            User.Role.STAFF,
        ] and branch is None:
            raise serializers.ValidationError({
                "branch": "Branch is required for Manager and Staff users."
            })

        return attrs

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError(
                "Admin users cannot be created or assigned through this API."
            )

        if value not in [
            User.Role.MANAGER,
            User.Role.STAFF,
        ]:
            raise serializers.ValidationError(
                "Role must be either MANAGER or STAFF."
            )

        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        if not password:
            raise serializers.ValidationError({
                "password": "Password is required."
            })

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
