import { MigrationInterface, QueryRunner } from "typeorm";

export class updateOrdersTable1652182051387 implements MigrationInterface {
    name = 'updateOrdersTable1652182051387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`driverMatchedAt\` \`driverMatchedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`heroMatchedAt\` \`heroMatchedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`heroPickUpedAt\` \`heroPickUpedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`departedAt\` \`departedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`loadedAt\` \`loadedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`arrivedAt\` \`arrivedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`feeCaculatedAt\` \`feeCaculatedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`completedAt\` \`completedAt\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`completedAt\` \`completedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`feeCaculatedAt\` \`feeCaculatedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`arrivedAt\` \`arrivedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`loadedAt\` \`loadedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`departedAt\` \`departedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`heroPickUpedAt\` \`heroPickUpedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`heroMatchedAt\` \`heroMatchedAt\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`driverMatchedAt\` \`driverMatchedAt\` datetime NOT NULL`);
    }

}
